# cbtree 0.9.3-3
### New Features:
* A new property, **_branchCheckBox_**, has been added to the tree. The **_branchCheckBox_**
property controls if checkboxes will be displayed for tree branches. The default is `true`.
if set to `false` the branch checkboxes will be hidden but still available for checking their
state.

* Tree Nodes can now be sorted using the new **_options_** property of the store models:
```javascript
var mySortOptions = {sort: [
  {attribute: "name", descending: true, ignoreCase: true},
  {attribute: "hair", ignoreCase: true},
  {attribute: "age"}
]};
var model = new TreeStoreModel( { store: store,
                                  query: {name: "Root"},
                                  options: {sort: mySortOptions}
                                });
```
For a detailed description of this new feature and the ABNF definition of the **_options_**
property please refer to the
[cbtree Wiki](https://github.com/pjekel/cbtree/wiki/CheckBox-Tree-Usage#sorting-tree-nodes)


### Bug Fixes:
* When the **_checkAttr_** property on the store model is set to anything other than the
default 'checked', both the expandChecked() and collapseUnChecked() method did not work
as documented. Issue #35: [expandChecked()](https://github.com/pjekel/cbtree/issues/35)

# cbtree 0.9.3-2

### Enhancements:
* The name of tree checkboxes will now default to the dijit generated checkbox id. This
will guarantee that any tree checkbox visible in a form will be included in a form submission.
See also the new properties **_openOnChecked_** and **_closeOnUnchecked_**.
* The TreeStyling extension now allows the wildcard character (*) to be used in icon object
properties when mapping values to icons.

### New Features:
* Two new properties have been added to the tree:
	1. openOnChecked
	2. closeOnUnchecked
* Two new functions have been added to the tree:
	1. expandChecked()
	2. collapseUnchecked()

Please refer to the wiki [documentation](https://github.com/pjekel/cbtree/wiki/CheckBox-Tree-API)
for a detailed description of the new features.

### Bug Fixes:
* When using an Observable store the tree/model/_base/BaseStoreModel class did not remove
obsolete Observers. Issue #28: [Observable vs Eventable store](https://github.com/pjekel/cbtree/issues/28)
* Icon styling provided with a mapped icon object was not applied. Issue #30:
[Mapping a property value to a specific icon object](https://github.com/pjekel/cbtree/issues/30)
* Root children always appeared as the last item when dragged and dropped. Issue: #31:
[DnD of root children](https://github.com/pjekel/cbtree/issues/31)

### Known issues:
Please see the Github project page for any [open](https://github.com/pjekel/cbtree/issues?page=1&state=open)
issues.