/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChangeResourceRecordSetsCommand, GetChangeCommand, ListHostedZonesByNameCommand, ListResourceRecordSetsCommand, ResourceRecord, Route53Client } from '@aws-sdk/client-route-53';

const getZones = async (client: Route53Client) => {
  const data = await client.send(new ListHostedZonesByNameCommand({}));

  const zoneData = data.HostedZones?.map(zone => {
    // drop '.' at the end of each zone
    zone.Name = zone.Name?.substr(0, zone.Name.length - 1);
    return zone;
  }) || [];

  if (data.IsTruncated) {
    throw 'Too many records to deal with. Some are truncated. ';
  }

  return zoneData;
};

const getChange = async (client: Route53Client, changeId: string) => {
  try {
    const change = await client.send(new GetChangeCommand({ Id: changeId }));
    return change;
  } catch (e) {
    console.log(`Error polling for change: ${changeId}:`, e);
    throw e;
  }
};

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

type Config = {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  debug: boolean;
  ensureSync: boolean;
};

const create = function(
  config: Config = {
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
    debug: false,
    ensureSync: false
  }
): any {
  const client = new Route53Client({
    credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    }
  });

  return {
    init: async (): Promise<void> => {
      // NOTHING TO SEE HERE
    },
    zones: async () => {
      try {
        const zones = await getZones(client);
        return zones.map(zone => zone.Name);
      } catch (e) {
        console.error('Error listing zones:', e);
        return null;
      }
    },
    set: async (data: any) => {
      const ch = data.challenge;
      const txt = ch.dnsAuthorization;
      const recordName = `${ch.dnsPrefix}.${ch.dnsZone}`;

      if (config.debug) {
        console.log(`Setting ${ch} to ${txt}`);
      }

      try {
        const zoneData = await getZones(client);
        const zone = zoneData.filter(zone => zone.Name === ch.dnsZone)[0];

        if (!zone) {
          console.error('Zone could not be found');
          return null;
        }

        const recordSetResults = await client.send(new ListResourceRecordSetsCommand({
          HostedZoneId: zone.Id
        }));

        if (config.debug) {
          console.log(
            `No existing records for ${recordName} in \n\t in:`,
            recordSetResults.ResourceRecordSets?.map(rrs => {
              return {
                name: rrs.Name,
                value: rrs.ResourceRecords?.map(rrs => rrs.Value).join(',')
              };
            })
          );
        }

        // check if record name already exists
        const existingRecord = (recordSetResults.ResourceRecordSets?.map(rrs => {
          rrs.Name = rrs.Name?.slice(0, -1);
          return rrs;
        }) || []) // Remove last dot (.) from resource record set names
          .filter(rrs => rrs.Name === recordName); // Only matching record(s)

        const newRecord: ResourceRecord = { Value: `"${txt}"` };
        let resourceRecords: ResourceRecord[] = [];

        if (existingRecord.length) {
          // record exists which means we need to append the new record and not set it from scratch (otherwise it replaces existing records)
          if (config.debug) {
            console.log('Record exists for:', recordName, ': ', existingRecord);
          }
          resourceRecords = [...existingRecord[0]?.ResourceRecords || [], newRecord];

          if (config.debug) {
            console.log(
              '\t setting it to:',
              resourceRecords.map(rrs => rrs.Value).join(',')
            );
          }
        } else {
          if (config.debug) {
            console.log(`Record does not exist ${recordName}`);
          }

          resourceRecords = [newRecord];
        }

        const setResults = await client.send(new ChangeResourceRecordSetsCommand({
          HostedZoneId: zone.Id,
          ChangeBatch: {
            Changes: [
              {
                Action: 'UPSERT',
                ResourceRecordSet: {
                  Name: recordName,
                  Type: 'TXT',
                  TTL: 300,
                  ResourceRecords: resourceRecords
                }
              }
            ]
          }
        }));

        if (config.debug) {
          console.log(`Successfully set ${recordName} to "${txt}"`);
        }

        if (config.ensureSync) {
          if (setResults && setResults.ChangeInfo && setResults.ChangeInfo.Id) {
            let status = setResults.ChangeInfo.Status;
            while (status === 'PENDING') {
              const timeout = 5000;

              if (config.debug) {
                console.log(
                  `\t but ... change is still pending. Will check again in ${timeout /
                    1000} seconds.`
                );
              }
              await sleep(timeout);
              const change = await getChange(client, setResults.ChangeInfo.Id);
              status = change?.ChangeInfo?.Status;
            }
          }
        }

        return true;
      } catch (e) {
        console.log('Error upserting txt record:', e);
        return null;
      }
    },

    remove: async (data: any) => {
      const ch = data.challenge;
      const txt = ch.dnsAuthorization;
      const recordName = `${ch.dnsPrefix}.${ch.dnsZone}`;

      if (config.debug) {
        console.log(`Removing ${recordName} value ${txt}`);
      }

      try {
        const zoneData = await getZones(client);
        const zone = zoneData.filter(zone => zone.Name === ch.dnsZone)[0];

        if (!zone) {
          console.error('Zone could not be found');
          return null;
        }

        // find record first
        const data = await client.send(new ListResourceRecordSetsCommand({
          HostedZoneId: zone.Id
        }));

        if (config.debug) {
          console.log(
            '\n\t from one of these existing records:',
            data.ResourceRecordSets?.map(rrs => {
              return {
                name: rrs.Name,
                value: rrs.ResourceRecords?.map(rrs => rrs.Value).join(',')
              };
            }) || []
          );
        }

        const match = data.ResourceRecordSets?.filter(
          rrs =>
            rrs.ResourceRecords?.filter(
              txtRs => txtRs.Value?.slice(1, -1) === txt
            ).length // remove quotes around record and match it against value we want to remove
        )[0]; // should only contain one match at most (index 0 doesn't throw here if it doesn't exist)

        // if more than one recordset, remove the one we don't want and keep the rest
        if (match && match.ResourceRecords && match.ResourceRecords.length > 1) {
          if (config.debug) {
            console.log('Upserting to delete a value from:', recordName);
          }
          // upsert
          const rr = match.ResourceRecords?.filter(
            rr => rr.Value?.slice(1, -1) !== txt // remove quotes
          );

          if (config.debug) {
            console.log(
              '\t new records will look like this:',
              rr?.map(r => r.Value)
            );
          }

          await client.send(new ChangeResourceRecordSetsCommand({
            HostedZoneId: zone.Id,
            ChangeBatch: {
              Changes: [
                {
                  Action: 'UPSERT',
                  ResourceRecordSet: {
                    Name: recordName,
                    Type: 'TXT',
                    TTL: 300,
                    ResourceRecords: rr
                  }
                }
              ]
            }
          }));
        } else {
          // only one record value exists, so delete it

          if (config.debug) {
            console.log('Deleting whole record:', recordName);
            console.log('\t value:', match?.ResourceRecords?.map(rr => rr.Value));
          }

          await client.send(new ChangeResourceRecordSetsCommand({
            HostedZoneId: zone.Id,
            ChangeBatch: {
              Changes: [
                {
                  Action: 'DELETE',
                  ResourceRecordSet: {
                    Name: recordName,
                    Type: 'TXT',
                    TTL: 300,
                    ResourceRecords: match?.ResourceRecords
                  }
                }
              ]
            }
          }));
        }

        return true;
      } catch (e) {
        console.log('Encountered an error deleting the record:', e);
        return null;
      }
    },

    get: async (data: any) => {
      const ch = data.challenge;
      const txt = ch.dnsAuthorization;

      if (config.debug) {
        console.log(`Getting record with ${txt} value`);
      }

      try {
        const zoneData = await getZones(client);

        const zone = zoneData.filter(zone => zone.Name === ch.dnsZone)[0];

        if (!zone) {
          console.error('Zone could not be found');
          return null;
        }

        const data = await client.send(new ListResourceRecordSetsCommand({
          HostedZoneId: zone.Id
        }));

        if (data.IsTruncated) {
          throw 'Too many records to deal with. Some are truncated';
        }

        const txtRecords = data.ResourceRecordSets?.filter(
          rrs => rrs.Type === 'TXT'
        ) || [];

        if (config.debug) {
          console.log('\t existing txt values:', txtRecords);
        }
        const match = txtRecords
          .map(
            rrs => rrs.ResourceRecords?.map(rec => rec.Value?.slice(1, -1)) // remove quotes sorrounding the strings
          )
          .filter(txtRecords => {
            const val = txtRecords?.filter(rec => rec === txt); // match possible multiple values
            return val?.length || 0;
          })
          .map(txtRec => {
            const match = txtRec?.filter(rec => rec === txt)[0]; // only one match should exist, get it
            return { dnsAuthorization: match };
          })[0];

        if (!match || match.dnsAuthorization === undefined) {
          return null;
        }

        return match;
      } catch (e) {
        console.log('Encountered an error getting TXT records:', e);
        return null;
      }
    }
  };
};

export { create };
export default create;