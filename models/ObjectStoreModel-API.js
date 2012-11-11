//
// Copyright (c) 2010-2012, Peter Jekel
// All rights reserved.
//
//	The Checkbox Tree (cbtree), also known as the 'Dijit Tree with Multi State Checkboxes'
//	is released under to following three licenses:
//
//	1 - BSD 2-Clause							 (http://thejekels.com/cbtree/LICENSE)
//	2 - The "New" BSD License			 (http://trac.dojotoolkit.org/browser/dojo/trunk/LICENSE#L13)
//	3 - The Academic Free License	 (http://trac.dojotoolkit.org/browser/dojo/trunk/LICENSE#L43)
//
//	In case of doubt, the BSD 2-Clause license takes precedence.
//
define(["dojo/_base/lang",
				"dojo/has",
				"dojo/when",
				"./ObjectStoreModel",
				"./_Parents"
       ], function (lang, has, when, ObjectStoreModel, Parents) {

	// Add cbTree model API to the available features list
	has.add("cbtree-objectStoreModel-API", true);

	// Requires JavaScript 1.8.5
	var defineProperty = Object.defineProperty;

	function objType(obj) {
		var objClass = Object.prototype.toString.call(obj);
		var type     = objClass.match(/^\[object\s*(\b.*\b)\]$/);
		return type ? type[1] : null;
	}

	function isObject(something) {
		// summary:
		//		Returns true is 'something' is an Object object and not an array,
		//		function or null.
		// something:
		//		Any type.
		// tag:
		//		Private
		return (objType(something) ===  "Object");
	}

	lang.extend(ObjectStoreModel, {

		// =======================================================================
		// Private Methods related to checked states

		_checkOrUncheck: function (/*String|Object*/ query, /*Boolean*/ newState, /*Callback*/ onComplete,
																/*thisArg*/ scope, /*Boolean*/ storeOnly) {
			// summary:
			//		Check or uncheck the checked state of all store items that match the
			//		query and have a checked state.
			//		This method is called by either the public methods 'check' or 'uncheck'
			//		providing an easy way to programmatically alter the checked state of a
			//		set of store items associated with the tree nodes.
			// query:
			//		A query object or string.   If query is a string the idProperty attribute
			//		of the store is used as the query attribute and the query string assigned
			//		as the associated value.
			// newState:
			//		New state to be applied to the store items.
			// onComplete:
			//		If an onComplete callback function is provided, the callback function
			//		will be called just once, after the last storeItem has been updated as:
			//		onComplete(matches, updates).
			// scope:
			//		If a scope object is provided, the function onComplete will be invoked
			//		in the context of the scope object. In the body of the callback function,
			//		the value of the "this" keyword will be the scope object. If no scope is
			//		is provided, onComplete will be called in the context of tree.model.
			// storeOnly:
			//		See fetchItemsWithChecked()
			// tag:
			//		private

			var matches = 0,
					updates = 0;

			this.fetchItemsWithChecked(query, function (storeItems) {
				storeItems.forEach( function (storeItem) {
					if (storeItem[this.checkedAttr] != newState) {
						this.setChecked(storeItem, newState);
						updates += 1;
					}
					matches += 1;
				}, this)
				if (onComplete) {
					onComplete.call((scope ? scope : this), matches, updates);
				}
			}, this, storeOnly);
		},

		// =======================================================================
		// Object store item getters and setters

		_ItemCheckedGetter: function (/*dojo.store.Item*/ storeItem) {
			// summary:
			//		Get the current checked state from the data store for the specified item.
			//		This is the hook for getItemAttr(item,"checked")
			// description:
			//		Get the current checked state from the dojo.data store. The checked state
			//		in the store can be: 'mixed', true, false or undefined. Undefined in this
			//		context means no checked identifier (checkedAttr) was found in the store
			// storeItem:
			//		The item in the dojo/store whose checked state is returned.
			// example:
			//	|	var currState = model.getItemAttr(item,"checked");
			// tag:
			//		private

			return this.getChecked(storeItem);
		},

	 _ItemCheckedSetter: function (/*dojo.store.Item*/ storeItem, /*Boolean*/ newState) {
			// summary:
			//		Update the checked state for the store item and the associated parents
			//		and children, if any. This is the hook for setItemAttr(item,"checked",value).
			// description:
			//		Update the checked state for a single store item and the associated
			//		parent(s) and children, if any. This method is called from the tree if
			//		the user checked/unchecked a checkbox. The parent and child tree nodes
			//		are updated to maintain consistency if 'checkedStrict' is set to true.
			//	storeItem:
			//		The item in the dojo/store whose checked state needs updating.
			//	newState:
			//		The new checked state: 'mixed', true or false
			//	example:
			//	|	model.setItemAttr(item,"checked",newState);
			// tags:
			//		private

			this.setChecked(storeItem, newState);
		},

		_ItemIdentityGetter: function (/*Object*/ storeItem){
			// summary:
			//		Provide the hook for getItemAttr(storeItem,"identity") calls. The
			//		getItemAttr() interface is the preferred method over the legacy
			//		getIdentity() method.
			// storeItem:
			//		The store or root item whose identity is returned.
			//	example:
			//	|	model.getItemAttr(item,"identity");
			// tag:
			//		private

			if (isObject(storeItem)) {
				return this.store.getIdentity(storeItem);	// Object
			}
		},

		_ItemIdentitySetter: function (storeItem, value){
			// summary:
			//		Hook for setItemAttr(storeItem,"identity",value) calls. However, changing
			//		the identity of a store item is NOT allowed.
			// tags:
			//		private
			throw new Error(this.moduleName+"::setItemAttr(): Identity attribute cannot be changed");
		},

		_ItemLabelGetter: function (storeItem){
			// summary:
			//		Provide the hook for getItemAttr(storeItem,"label") calls. The getItemAttr()
			//		interface is the preferred method over the legacy getLabel() method.
			// storeItem:
			//		The store item whose label is returned.
			// tag:
			//		private

			if (isObject(storeItem)) {
				return this.getLabel(storeItem);
			}
		},

		_ItemLabelSetter: function (storeItem, value){
			// summary:
			//		Hook for setItemAttr(storeItem,"label",value) calls.
			// storeItem:
			//		The store item whose label is being set.
			// value:
			//		New label value.
			// tags:
			//		private

			if (this.labelAttr) {
				if (isObject(storeItem) && typeof value === "string") {
					this._setValue( storeItem, this.labelAttr, value);
				}
			}
		},

		_ItemParentsGetter: function (storeItem) {
			// summary:
			// storeItem:
			//		The store item whose parent(s) are returned.
			return this.getParents(storeItem);
		},

		getItemAttr: function (/*dojo.store.Item*/ storeItem , /*String*/ attribute){
			// summary:
			//		Provide the getter capabilities for store items thru the model.
			//		The getItemAttr() method strictly operates on store items not
			//		the model itself.
			// storeItem:
			//		The store item whose property to get.
			// attribute:
			//		Name of property to get
			// tag:
			//		public

			var attr = (attribute == this.checkedAttr ? "checked" : attribute);

			if (isObject(storeItem)) {
				var func = this._getFuncNames("Item", attr);
				if (typeof this[func.get] === "function") {
					return this[func.get](storeItem);
				} else {
					return storeItem[attr];
				}
			}
			throw new Error(this.moduleName+"::getItemAttr(): argument is not a valid store item.");
		},

		setItemAttr: function (/*dojo.store.Item*/ storeItem, /*String*/ attribute, /*anytype*/ value) {
			// summary:
			//		Provide the setter capabilities for store items thru the model.
			//		The setItemAttr() method strictly operates on store items not
			//		the model itself.
			// storeItem:
			//		The store item whose property is to be set.
			// attribute:
			//		Property name to set.
			// value:
			//		Value to be applied.
			// tag:
			//		public

			if (this._writeEnabled) {
				var attr = (attribute == this.checkedAttr ? "checked" : attribute);
				if (isObject(storeItem)) {
					var func = this._getFuncNames("Item", attr);
					if (typeof this[func.set] === "function") {
						return this[func.set](storeItem,value);
					} else {
						this._setValue(storeItem, attr, value);
						return true;
					}
				} else {
					throw new Error(this.moduleName+"::setItemAttr(): argument is not a valid store item.");
				}
			} else {
				throw new Error(this.moduleName+"::setItemAttr(): store is not write enabled.");
			}
		},

		// =======================================================================
		// Inspecting and validating items

		fetchItem: function (/*String|Object*/ args, /*Callback?*/ onComplete,/*thisArg?*/ scope){
			// summary:
			//		Get the store item that matches args. Parameter args is either an
			//		object or a string.
			// args:
			//		An object or string used to query the store. If args is a string its
			//		value is assigned to the store idProperty in the query.
			//	onComplete:
			//		 User specified callback method which is called on completion with the
			//		first store items that matched the query argument. Method onComplete
			//		is called as: onComplete(storeItems) in the context of scope if scope
			//		is specified otherwise in the active context (this).
			//	scope:
			//		If a scope object is provided, the function onComplete will be invoked
			//		in the context of the scope object. In the body of the callback function,
			//		the value of the "this" keyword will be the scope object. If no scope
			//		object is provided, onComplete will be called in the context of tree.model.
			// tag:
			//		public

			var idQuery    = this._anyToQuery(args, null);
			var scope      = scope || this;

			if (idQuery && onComplete){
				when(this.store.query(idQuery), function(queryResult) {
					var items = Array.prototype.slice.call(queryResult);
					onComplete.call(scope, (items.length ? items[0] : undefined));
				});
			}
		},

		fetchItemsWithChecked: function (/*String|Object*/ query, /*Callback?*/ onComplete, /*thisArg?*/ scope,
																			/*Boolean?*/ storeOnly) {
			// summary:
			//		Get the list of store items that match the query and have a checked
			//		state, that is, a checkedAttr property.
			// description:
			//		Get the list of store items that match the query and have a checked state.
			//		This method provides a simplified interface to the object stores query()
			//		method.
			//	 query:
			//		A query object or string. If query is a string the identifier attribute
			//		of the store is used as the query attribute and the string assigned as
			//		the associated value.
			//	onComplete:
			//		 User specified callback method which is called on completion with an
			//		array of store items that matched the query argument. Method onComplete
			//		is called as: onComplete(storeItems) in the context of scope if scope
			//		is specified otherwise in the active context (this).
			//	scope:
			//		If a scope object is provided, the function onComplete will be invoked
			//		in the context of the scope object. In the body of the callback function,
			//		the value of the "this" keyword will be the scope object. If no scope
			//		object is provided, onComplete will be called in the context of tree.model.
			// storeOnly:
			//		Indicates if the fetch operation should be limited to the in-memory store
			//		only. Some stores may fetch data from a back-end server when performing a
			//		deep search. However, when querying attributes, some attributes may only
			//		be available in the in-memory store such is the case with a FileStore
			//		having custom attributes. (See FileStore.fetch() for additional details).
			// tag:
			//		public

			var storeQuery = this._anyToQuery( query, null );
			var storeItems = [];
			var storeOnly  = (storeOnly !== undefined) ? storeOnly : true;
			var scope      = scope || this;
			var self       = this;

			if (isObject(storeQuery)) {
				when( this.store.query(storeQuery, {storeOnly: storeOnly}), function(items) {
					items.forEach( function(item) {
						if (item[self.checkedAttr]) {
							storeItems.push(item);
						} else {
							// If the checked attribute is missing it can be an indication the item
							// has not been rendered yet in any tree. Therefore check if it should
							// have the attribute and, if so, create it and apply the default state.
							if (self.checkedAll) {
								self.setChecked(item, this.checkedState);
								storeItems.push(item);
							}
						}
					});
					if (onComplete) {
						onComplete.call(scope, storeItems);
					}
				}, this.onError);
			} else {
				throw new Error(this.moduleName+"::fetchItemsWithChecked(): query must be of type object.");
			}
		},

		isRootItem: function (/*AnyType*/ something){
			// summary:
			//		Returns true if 'something' is a child of the root otherwise false.
			// item:
			//		A valid dojo/store item.
			// tag:
			//		public

			if (something !== this.root){
				var id = this.store.getIdentity(this.root);
				if (id) {
					var parents = new Parents(something[this.parentAttr]);
					return parents.contains(id);
				}
			}
			return false;
		},

		// =======================================================================
		// Write interface

		addReference: function (/*dojo.store.Item*/ childItem, /*dojo.store.Item*/ parentItem){
			// summary:
			//		Add an existing item to the parentItem by reference.
			// childItem:
			//		Child item whose parent property is extended. If the store is a single
			//		parent store, the childs parent is replaced with the new parent and
			// 		thus moving a child from one parent to another. Otherwise the parent
			//		is added to the list of parents.
			// parentItem:
			//		Parent item.
			// tag:
			//		public

			if (childItem && isObject(childItem)) {
				if (parentItem && isObject(parentItem)) {
					var parentId = this.store.getIdentity(parentItem);
					var parents  = new Parents( childItem[this.parentAttr] );

					if (parents.add(parentId)) {
						this._setValue(childItem, this.parentAttr, parents.toValue());

						if (this._notObservable) {
							if (parents.multiple || !parents.input) {
								// Multi parented store or no previous parent, just add the child to the new parent.
								var newChildren = this._addChildToCache( childItem, parentItem );
								this.onChildrenChange( parentItem, newChildren );
							} else {
								// It's a single parented store so we've got to move the child from
								// the original parent to the new parent instead of just adding it.
								var oldParentItem = this.store.get(parents.input);
								var self = this;

								when( oldParentItem, function(oldParentItem) {
									var oldChildren = self._removeChildFromCache( childItem, oldParentItem );
									var newChildren = self._addChildToCache( childItem, parentItem );
									self.onChildrenChange( oldParentItem, oldChildren );
									self.onChildrenChange( parentItem, newChildren );
								});
							}
						}
						return true;
					}
					return false;
				}
			}
			throw new Error(this.moduleName+"::addReference(): Invalid parent or child item");
		},

		attachToRoot: function (/*dojo.store.Item*/ storeItem){
			// summary:
			//		Attach store item to the root by adding the root as a parent of the
			//		store item.
			// storeItem:
			//		A valid dojo/store item.
			// tag:
			//		public

			if (storeItem !== this.root){
				if (this.addReference(storeItem, this.root)) {
					this.onRootChange(storeItem, "attach");
				}
			}
		},

		check: function (/*Object|String*/ query, /*Callback*/ onComplete, /*thisArg*/ scope, /*Boolean?*/ storeOnly) {
			// summary:
			//		Check all store items that match the query and have a checked state.
			// description:
			//		See description _checkOrUncheck()
			//	example:
			//		model.check({ name: "John" });
			//	| model.check("John", myCallback, this);
			// tag:
			//		public

			// If in strict checked mode the store is already loaded and therefore no
			// need to fetch the store again.
			if (this.checkedStrict) {
				storeOnly = true;
			}
			this._checkOrUncheck(query, true, onComplete, scope, storeOnly);
		},

		detachFromRoot: function (/*dojo.store.Item*/ storeItem) {
			// summary:
			//		Detach item from the root by removing the root as a parent.
			// storeItem:
			//		A valid dojo/store item.
			// tag:
			//		public

			if (storeItem !== this.root) {
				if( this.removeReference(storeItem, this.root)) {
					this.onRootChange(storeItem, "detach");
				}
			}
		},

		newReferenceItem: function (/*dojo.dnd.Item*/ args, /*dojo.store.Item*/ parent, /*int?*/ insertIndex){
			// summary:
			//		For a dojo/store this is effectively the same as adding a new item.
			// args:
			//		A javascript object defining the initial content of the item as a set
			//		of JavaScript 'property name: value' pairs.
			// parent:
			//		Optional, a valid store item that will serve as the parent of the new
			//		item. (see also newItem())
			// insertIndex:
			//		If specified the location in the parents list of child items.
			// tag:
			//		public

			return this.newItem( args, parent, insertIndex );
		},

		removeReference: function (/*dojo.store.Item*/ childItem, /*dojo.store.Item*/ parentItem){
			// summary:
			//		Remove a child reference from its parent. Only the references are
			//		removed, the childItem is not delete.
			// childItem:
			//		Child item to be removed from parents children list.
			// parentItem:
			//		Parent item.
			// tag:
			//		public

			if (childItem && isObject(childItem)) {
				if (parentItem && isObject(parentItem)) {
					var parentId = this.store.getIdentity(parentItem);
					var parents  = new Parents( childItem[this.parentAttr] );

					if (parents.length && parents.remove(parentId)) {
						this._setValue(childItem, this.parentAttr, parents.toValue());

						if (this._notObservable) {
							var newChildren = this._removeChildFromCache( childItem, parentItem );
							this.onChildrenChange( parentItem, newChildren );
						}
						return true;
					}
					return false;
				}
			}
			throw new Error(this.moduleName+"::removeReference(): Invalid parent or child item");
		},

		uncheck: function (/*Object|String*/ query, /*Callback*/ onComplete, /*thisArg*/ scope, /*Boolean?*/ storeOnly) {
			// summary:
			//		Uncheck all store items that match the query and have a checked state.
			// description:
			//		See description _checkOrUncheck()
			//	example:
			//		uncheck({ name: "John" });
			//	| uncheck("John", myCallback, this);
			// tag:
			//		public

			// If in strict checked mode the store is already loaded and therefore no
			// need to fetch the store again.
			if (this.checkedStrict) {
				storeOnly = true;
			}
			this._checkOrUncheck(query, false, onComplete, scope, storeOnly);
		},

		// =======================================================================
		// Misc Private Methods

		_anyToQuery: function (/*String|Object*/ args, /*String?*/ attribute){
			// summary:
			// args:
			//		 Query object, if args is a string it value is assigned to the store
			//		identifier property in the query.
			// attribute:
			//		Optional attribute name.	If specified, the attribute in args to be
			//		used as its identifier. If an external item is dropped on the tree,
			//		the new item may not have the same identifier property as all store
			//		items do.
			// tag:
			//		private

			var identAttr = this.store.idProperty;

			if (identAttr){
				var objAttr = attribute ? attribute : identAttr,
						query = {};
				if (typeof args === "string") {
					query[identAttr] = args;
					return query;
				}
				if (args && isObject(args)){
					lang.mixin( query, args );
					if (args[objAttr]) {
						query[identAttr] = args[objAttr]
					}
					return query;
				} else {
					query[identAttr] = /./;
					return query;
				}
			}
			return null;
		},

		_getFuncNames: function (/*String*/ prefix, /*String*/ name) {
			// summary:
			//		Helper function for the get() and set() methods. Returns the function names
			//		in lowerCamelCase for the get and set functions associated with the 'name'
			//		property.
			// name:
			//		Attribute name.
			// tags:
			//		private

			if (typeof name === "string") {
				var cc = name.replace(/^[a-z]|-[a-zA-Z]/g, function (c){ return c.charAt(c.length-1).toUpperCase(); });
				var fncSet = { set: "_"+prefix+cc+"Setter", get: "_"+prefix+cc+"Getter" };
				return fncSet;
			}
			throw new Error(this.moduleName+"::_getFuncNames(): get"+prefix+"/set"+prefix+" attribute name must be of type string.");
		}

	});	/* end lang.extend() */

});	/* end define() */