## Changelog

### [v0.2.0](https://github.com/geniuszmath75/personal-portfolio-platform/compare/v0.1.0...v0.2.0) - 

#### New Features

-  add ProjectCard component, projects page and store [`1590709`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/1590709ec2ccd0538e27246b22e39e6fe8e6bd3d)
-  add pagination and filtering on projects page [`d2425de`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/d2425de10884c9ec5f5a279242ef91ec3a40bbfe)
-  add ProjectSchema model which represents a project in /projects page [`b6867cb`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/b6867cb76acd7b6f67afddd53c28c64b2a06eb45)
-  add pagination metadata object in GET /projects endpoint [`d4a529b`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/d4a529b97b0e35655debc551fed7f31dd3feda2a)
-  add /projects endpoint returning list of projects [`b57829b`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/b57829b1ef24a87c7ed93e50b5f3aa6afd53a3ba)

#### Refactoring and Updates

-  create Image interface and update Project model [`2642615`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/2642615c6985f841b2f007274dccadfc3a0e0335)
-  extract spinner and label into LoadingAnimation and move full-page overlay into BaseIndicator [`0343b29`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/0343b294854d00f86108bbab8a6c7e6aeb9afb20)
-  move test files to new directory structure [`3b6fb1b`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/3b6fb1baa3c021cbc28137f9440fe346a2704dc3)
-  create additional folders for server API tests [`ebf8dcb`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/ebf8dcbca8885f0674dd347c16f9228ba2db9895)

#### Changes to Test Assests

-  add unit tests for Project model and Image schema [`314be01`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/314be01d6162a6d6ecb9b7b6773d0a8d86a8350f)
-  add or update unit tests with Nuxt environment for BaseFilterBar, BaseIndicator, BasePagination LoadingAnimation components, usePagination composable and projectStore [`8526794`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/85267943c01a2f857db67aeed55995c3c89aea0e)
-  add unit tests with Nuxt environment for pagination.ts util, update tests for getAllProjects controller and add mongoose-find.t helper mock [`5584969`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/55849697a2657406d711a1596ea366032510be2a)
-  add unit tests with Nuxt environment for ProjectCard component and projectsStore [`0c8880c`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/0c8880c6890f0de23ef6312a59b5e010c343d3c3)
-  add unit tests with Nuxt environment for /projects/index.get endpoint and getAllProjects controller [`f2e3996`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/f2e399679f770ec3e9ac7986f1fff4e69b10f82c)

#### Tidying of Code eg Whitespace

-  visual fixes in CHANGELOG template [`10ab776`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/10ab776a67e97e67d3deed600ebf3c77bc3171d7)

### v0.1.0

#### New Features

-  add SectionContent, AppFooter and global stores for sections & loading [`d7f0924`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/d7f09240c895c9ca6dd3c0ac9a8f4610560d32c3)
-  add UserSchema model which represents user in DB [`d5a226b`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/d5a226b301b5dbda0b042d595902b0cc75f14188)
-  add AppNavbar component. create default layout and empty pages for navbar routing [`11fe9d5`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/11fe9d51561ec26a3b3e999ec67c1410f952a5cd)
-  add SectionSchema model which represents a section on the main page [`5de5a6f`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/5de5a6f1a580fa021ee6e90b6da358d28c227353)
-  add login endpoint and authentication controller [`96fb4c6`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/96fb4c6e7e8b8241ac97a380e09591f76ace953a)
-  add LoadingAnimation component which is displayed before loading every page [`31919f6`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/31919f639dd401a131ed84d5cdc41f64515d8de1)
-  add '/sections' endpoint returning list of main page sections [`a450627`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/a4506276134eadba621e6a2d906a7be2f0fcd27c)

#### Fixes

-  add custom validators to some Section submodels. Remove redundant validators in GroupBlockItemSchema. [`241dd92`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/241dd925ef933dca234538a9d502a28c1df72ed9)

#### Chores And Housekeeping

-  reinstall dependencies. Remove 'includes' property from tsconfig.json. Visual improvement in nuxt.config.ts [`11659c9`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/11659c9153d4d0abde29ff04434636dc7b6f8a0d)
-  Vitest configuration and linting fixes [`1e8d37f`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/1e8d37fdb91402527cd013a8f1aab743f2f9850a)
-  edit TailwindCSS config. add @nuxt/fonts module to dependencies [`c0dd806`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/c0dd806644d01163b168d738bdcf7a19a8105aeb)
-  configure connection with MongoDB database [`3f256eb`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/3f256ebf756cd99d86b40e575ac6ab6416e6bea8)
-  auto-changelog configuration [`68bb018`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/68bb018edb226b1b88b4536a3ab80451c43ebf8f)
-  configure Pinia plugin [`b212827`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/b212827c80f7cdc87d16179d8ce695ae0281e5d8)
-  release 0.1.0 [`9b079d6`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/9b079d67d264eeb3e1e49bdb031927ad199f4440)
-  add three custom fontFamilies and boxShadows to tailwind.config.ts. Set fontFamily to font-default in default.vue [`c76462d`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/c76462dfa91247209fab1f4d439d4dd51b00712c)
-  change app name in package.json [`02cbebf`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/02cbebffc2ec249c9212c1ad4953444558f09a71)
-  add comments for DB connection methods [`a2d277b`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/a2d277bf03448a917d7942a312343a187b04c41d)
-  add tsconfig.buildinfo and tailwind.config.js to .gitignore [`875516b`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/875516b4f959b647018d8e4ae4ee839870115271)

#### Refactoring and Updates

-  move ISection interface to 'shared' folder and add SectionsResponse interface. fix imports in models and tests [`48ab670`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/48ab6700809b26112a07286afb75599448a7de91)
-  restructure User types and model [`6f4d232`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/6f4d23295e933fa2194eb9c11130ba4056c4899b)
-  move checkItemColSpan logic to utils directory. Logic fixes in SectionContent [`27afaa2`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/27afaa294a677a04702107d44220eeb636a5aa6d)
-  separate BaseBlock interface with 'kind' property; change ParagraphBlock, ImageBlock, ButtonBlock and GroupBlock from type to interface and extend the BaseBlock; add BlockKind enum; add discriminators in SectionSchema for types of 'blocks' property [`6f915f0`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/6f915f09867f411e603f9fa29b487e5ee3000b6f)

#### Changes to Test Assests

-  add unit test for 'utils', update vitest config and setup file. [`2f7c83e`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/2f7c83ed5c737332d6297456244022f6619fd653)
-  add unit tests for Section, User models and function connecting with DB [`ba4c2ad`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/ba4c2ad89d0e9e4476c94919ce192b98be5e9f71)
-  add unit tests with Nuxt environment for AppNavbar, AppFooter, LoadingAnimation, SectionContent components, default layout and loadingStore, sectionsStore Pinia stores [`421eb71`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/421eb716cb780ee4bb6cfcb20b72b262c276831c)
-  add unit tests with Nuxt runtime for /auth/login.post and /sections/index.get endpoints, auth and getAllSections controllers, Nitro plugin connecting with MongoDB [`37240c9`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/37240c91ab48fa235138c6388ecb9f260b3bbc59)
-  add Nuxt environment setup and utilities [`193ef45`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/193ef45e94aa9937cf3daba07e157a730aacd9b5)

#### General Changes

- init: initial project setup [`b9625eb`](https://github.com/geniuszmath75/personal-portfolio-platform/commit/b9625eb4835c914b80aa572bf86d2dc192a1c725)
