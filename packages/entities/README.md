# @collabsoft-net/entities

Shared entities

## Disclaimer

It is important to note that this is specifically created to help our (Collabsoft) own app development goals. 

We do not provide any warranty as to the stability of features or the (continued) availability of packages. Collabsoft retains the sole right to make architectural choices without any regard to how this may impact other projects.

We also provide minimal to no documentation. The project is built using Typescript, so typings are supported, but that's about it. If you want to know what a certain package and/or function is doing, you'd best look at the source code.

_So why did we make it open source?_

Because we hope that the Atlassian Marketplace Partner community can benefit from what we've been doing.

Please feel free to browse the code, copy it, adjust it, learn from our mistakes and improve it to your own benefit.

The code has been published with a permissive license (Apache 2.0) and can be used in any way you seem fit for your operation.

You are still more than welcome to install the packages from our Github package repository, but be aware that doing so is at your own risk

## I'm feeling lucky 

Ok, so if you don't want to be a copy pasta warrior, you can also just use the published packages. Just remember, ye be warned, here be dragons!

_When using npm_

Please make sure to add the following to your `.npmrc` file

```
@collabsoft-net:registry=https://npm.pkg.github.com
```

and run

```
npm install @collabsoft-net/entities
```

_When using Yarn_

Add the following to your `.yarnrc.yml` file:

```
npmScopes:
  collabsoft-net:
    npmRegistryServer: "https://npm.pkg.github.com"
```

and run

```
yarn add @collabsoft-net/entities
```

## Contributions

Obviously we're open to any contribution in the form of issue reports and/or PRs, but we do not give any guarantees as to whether these will be fixed and/or merged.

It is recommended to file an issue before starting work on a PR to make sure that we agree to the proposed fix before you start doing any work.

Again, there is no documentation on how to build this project locally. You'll have to figure it out yourself. We can provide some guidance once you've filed an issue report and all parties agreed that this is worthy of a PR.

## License & other legal stuff

Licensed under the Apache License, Version 2.0 (the "License"); You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

### Important usage notice

The packages in this project rely heavily on other 3rd party Open Source projects, install through npm/yarn. These projects all have their own licenses. Although commercial use of Collabsoft packages is permitted under the Apache 2.0 license, this right is limited to the "original content" created as part of this project. Please make sure you check the licenses of all 3rd party components. Collabsoft cannot be held responsible for non-compliance with 3rd party licenses when using the packages or source code. The use of 3rd party projects is listed in the dependency section of the package.json or inline in the code (when applicable).