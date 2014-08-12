Metamaps.Backbone = {};
Metamaps.Backbone.Map = Backbone.Model.extend({
    urlRoot: '/maps',
    blacklist: ['created_at', 'updated_at', 'topics', 'synapses', 'mappings', 'mappers'],
    toJSON: function (options) {
        return _.omit(this.attributes, this.blacklist);
    },
    authorizeToEdit: function (mapper) {
        if (mapper && (this.get('permission') === "commons" || this.get('user_id') === mapper.get('id'))) return true;
        else return false;
    },
    getUser: function () {
        return Metamaps.Mapper.get(this.get('user_id'));
    },
    fetchContained: function () {
        var bb = Metamaps.Backbone;
        var start = function (data) {
            this.set('mappers', new bb.MapperCollection(data.mappers));
            this.set('topics', new bb.TopicCollection(data.topics));
            this.set('synapses', new bb.SynapseCollection(data.synapses));
            this.set('mappings', new bb.MappingCollection(data.mappings));
        }

        $.ajax({
            url: "/maps/" + this.id + "/contains",
            success: start,
            async: false
        });
    },
    getTopics: function () {
        if (!this.get('topics')) {
            this.fetchContained();
        }
        return this.get('topics');
    },
    getSynapses: function () {
        if (!this.get('synapses')) {
            this.fetchContained();
        }
        return this.get('synapses');
    },
    getMappings: function () {
        if (!this.get('mappings')) {
            this.fetchContained();
        }
        return this.get('mappings');
    },
    getMappers: function () {
        if (!this.get('mappers')) {
            this.fetchContained();
        }
        return this.get('mappers');
    },
    attrForCards: function () {
        var obj = {
            id: this.id,
            name: this.get('name'),
            desc: this.get('desc'),
            username: this.getUser().get('name'),
            mkPermission: this.get("permission") ? this.get("permission").substring(0, 2) : "commons",
            editPermission: this.authorizeToEdit(Metamaps.Active.Mapper) ? 'canEdit' : 'cannotEdit',
            topicCount: this.getTopics().length,
            synapseCount: this.getSynapses().length,
            createdAt: this.get('created_at')
        };
        return obj;
    }
});
Metamaps.Backbone.MapsCollection = Backbone.Collection.extend({
    model: Metamaps.Backbone.Map,
    initialize: function(models, options) {
        this.id = options.id;
        this.sortBy = options.sortBy;
    },
    url: function() {
        return '/explore/' + this.id + '.json';
    },
    comparator: function (a, b) {
        a = a.get(this.sortBy);
        b = b.get(this.sortBy);
        if (this.sortBy === 'name') {
            a = a ? a.toLowerCase() : "";
            b = b ? b.toLowerCase() : "";
        }
        return a > b ? 1 : a < b ? -1 : 0;
    },
    getMaps: function () {

        Metamaps.Loading.loader.show();

        var self = this;

        this.fetch({
            reset: true,
            success: function (collection, response, options) {
                // you can pass additional options to the event you trigger here as well
                self.trigger('successOnFetch');
            },
            error: function (collection, response, options) {
                // you can pass additional options to the event you trigger here as well
                self.trigger('errorOnFetch');
            }
        });
    }
});

Metamaps.Backbone.Mapper = Backbone.Model.extend({
    urlRoot: '/users',
    blacklist: ['created_at', 'updated_at'],
    toJSON: function (options) {
        return _.omit(this.attributes, this.blacklist);
    },
    prepareLiForFilter: function () {
        var li = '';
        li += '<li data-id="' + this.id.toString() + '">';      
        li += '<img src="/assets/icons/person.png" data-id="' + this.id.toString() + '"';
        li += ' alt="' + this.get('name') + '" />';      
        li += '<p>' + this.get('name') + '</p></li>';
        return li;
    }
});
Metamaps.Backbone.MapperCollection = Backbone.Collection.extend({
    model: Metamaps.Backbone.Mapper,
    url: '/users'
});