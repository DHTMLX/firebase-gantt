(function() {

    var gEventsCollection = null,
        gFirebaseListenersCollection = null,
        gDataSnapshots = null;
    
    gantt.firebase = function(dataSnapshots) {
        gDataSnapshots = dataSnapshots;
        gEventsCollection = new DataCollection();
        gFirebaseListenersCollection = new DataCollection();

        initDataSnapshotHandler(this, dataSnapshots["tasks"], "task");
        initDataSnapshotHandler(this, dataSnapshots["links"], "link");

        function initDataSnapshotHandler(gantt, dataSnapshot, itemType) {
            var itemTypeSettings = getItemTypeSettings(gantt, itemType),
                eventsNames = itemTypeSettings.events_names;

            var snapshotHandlerObj = new SnapshotHandler(dataSnapshot);

            gEventsCollection.add(gantt.attachEvent(eventsNames.added, function(itemId, item) {
                snapshotHandlerObj.save(item);
            }));

            gEventsCollection.add(gantt.attachEvent(eventsNames.updated, function(itemId, item) {
                snapshotHandlerObj.save(item);
            }));

            gEventsCollection.add(gantt.attachEvent(eventsNames.removed, function(itemId) {
                snapshotHandlerObj.remove(itemId);
            }));

            var methods = itemTypeSettings.methods;
            gFirebaseListenersCollection.add(dataSnapshot.on("child_added", function(dataSnapshot) {
                var itemData = serializeData(dataSnapshot.val(), true);

                if(!methods.isExists(itemData.id))
                    methods.add(itemData);
            }));

            gFirebaseListenersCollection.add(dataSnapshot.on("child_changed", function(dataSnapshot) {
                var itemData = serializeData(dataSnapshot.val(), true);

                if(!methods.isExists(itemData.id))
                    return false;

                var item = methods.get(itemData.id);
                for(var key in itemData)
                    item[key] = itemData[key];

                methods.update(itemData.id);
                return true;
            }));

            gFirebaseListenersCollection.add(dataSnapshot.on("child_removed", function(dataSnapshot) {
                var itemData = dataSnapshot.val();
                if(methods.isExists(itemData.id)) {
                    var item = methods.get(itemData.id);
                    methods.remove(item.id);
                }
            }));

        }

        function getItemTypeSettings(gantt, itemType) {
            var methods = {
                    isExists: function() {},
                    get: function() {},
                    add: function() {},
                    update: function() {},
                    remove: function() {}
                },
                eventsNames = {
                    added: "",
                    updated: "",
                    removed: ""
                };

            function isExistsItem(itemId) {
                return (itemId != null);
            }

            switch(itemType) {
                case "task":
                    methods.isExists = function(taskId) {return (isExistsItem(taskId) && gantt.isTaskExists(taskId))};
                    methods.get = gantt.getTask;
                    methods.add = gantt.addTask;
                    methods.update = gantt.updateTask;
                    methods.remove = gantt.deleteTask;
                    eventsNames.added = "onAfterTaskAdd";
                    eventsNames.updated = "onAfterTaskUpdate";
                    eventsNames.removed = "onAfterTaskDelete";
                    break;

                case "link":
                    methods.isExists = function(linkId) {return (isExistsItem(linkId) && gantt.isLinkExists(linkId))};
                    methods.get = gantt.getLink;
                    methods.add = gantt.addLink;
                    methods.update = gantt.updateLink;
                    methods.remove = gantt.deleteLink;
                    eventsNames.added = "onAfterLinkAdd";
                    eventsNames.updated = "onAfterLinkUpdate";
                    eventsNames.removed = "onAfterLinkDelete";
                    break;
            }

            for(var method in methods)
                methods[method] = methods[method].bind(gantt);

            return {methods: methods, events_names: eventsNames};
        }
    };
    
    gantt.firebaseStop = function() {
        var self = this;
        if(gEventsCollection) {
            gEventsCollection.each(function(eventId) {
                self.detachEvent(eventId);
            });
            gEventsCollection.clean();
        }

        if(gFirebaseListenersCollection) {
            var eventsTypes = ["child_added", "child_changed", "child_removed"];
            gFirebaseListenersCollection.each(function(listener) {
                for(var i = 0; i < eventsTypes.count; i++) {
                    var eventType = eventsTypes[i];
                    gDataSnapshots["tasks"].off(eventType, listener);
                    gDataSnapshots["links"].off(eventType, listener);
                }
            });
            gFirebaseListenersCollection.clean();
        }
    };
    
    function serializeData(item, unserilize) {
        var parsedData = {};
        for(var property in item) {
            if(property.charAt(0) == "$")
                continue;

            parsedData[property] = item[property].valueOf();

            if(property == "id")
                parsedData[property] = parsedData[property].toString();

            if(unserilize && (property == "start_date" || property == "end_date"))
                parsedData[property] = new Date(parsedData[property]);
        }

        return parsedData;
    }
    
    function SnapshotHandler(dataSnapshot) {

        this.save = function(item) {
            item = serializeData(item);
            this.findItem(item.id, function(dataSnapshot) {
                if(dataSnapshot.exists())
                    dataSnapshot.ref().update(item);
                else
                    dataSnapshot.ref().push(item);
            });
        };

        this.remove = function(eventId) {
            this.findItem(eventId, function(dataSnapshot) {
                if(dataSnapshot.exists())
                    dataSnapshot.ref().remove();
            });
        };

        this.findItem = function(eventId, callback) {
            dataSnapshot.orderByChild("id").equalTo(eventId).once("value", function(eventSnapshot) {
                if(!eventSnapshot.exists())
                    callback.call(null, eventSnapshot);

                eventSnapshot.forEach(function(dataSnapshot) {
                    callback.call(null, dataSnapshot);
                });
            });
        };
    }
    
    function DataCollection() {
        var collectionData = {},
            currentUid = new Date().valueOf();

        function _uid() {
            return currentUid++;
        }

        this.add = function(data) {
            var dataId = _uid();
            collectionData[dataId] = data;
            return dataId;
        };

        this.each = function(handler) {
            for(var key in collectionData)
                handler.call(this, collectionData[key]);
        };

        this.clean = function() {
            collectionData = {};
        };
    }

})();