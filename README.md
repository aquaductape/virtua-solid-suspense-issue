# virtua SolidJS Suspense issue

**Describe the bug**
When virtua VList parent Suspense triggers and inserts dom nodes back, rendered items style position is incorrect and placed further down the viewport, resulting in blank scroll viewport.

https://github.com/user-attachments/assets/d3bd33c7-d80b-4346-93b9-5b94f9fe532f


**Expected behavior**
For VList to preserve items and scroll position when Suspense is finished and renders content


**To Reproduce**
1. clone repo https://github.com/aquaductape/virtua-solid-suspense-issue
2. scroll until "Entity 8" is no longer visible in scroll viewport
3. click any ℹ️ button, which fetches resource
4. Triggers parent Suspense
5. Suspense fallback renders
6. Resource is done
7. Suspense renders content
8. VList renders items, but are incorrectly posisitioned on y axis, sometimes outside of scroll viewport


**Platform:**

- OS: MacOS 15.7.3 (24G419)
- Browser: Chrome 143.0.7499.41 (Official Build) (arm64)
- Version of virtua: 0.48.2
- Version of framework: solid-js 1.9.10