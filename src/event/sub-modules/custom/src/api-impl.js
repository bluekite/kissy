/**
 * @ignore
 * custom event target for publish and subscribe
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/api-impl', function (S, api, Event, ObservableCustomEvent) {
    var trim = S.trim,
        _Utils = Event._Utils,
        splitAndRun = _Utils.splitAndRun,
        KS_BUBBLE_TARGETS = '__~ks_bubble_targets';


    return S.mix(api,
        /**
         * @class KISSY.Event.Target
         * @singleton
         * EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
         * and also allows other EventTargets to target the object with events sourced from the other object.
         *
         * EventTarget is designed to be used with S.augment to allow events to be listened to and fired by name.
         *
         * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
         * or will not be created at all.
         */
        {

            /**
             * @ignore
             */
            fire: function (target, type, eventData) {
                var self = target,
                    ret = undefined,
                    targets = api.getTargets(self, 1),
                    hasTargets = targets && targets.length;

                eventData = eventData || {};

                splitAndRun(type, function (type) {

                    var r2, customEvent,
                        typedGroups = _Utils.getTypedGroups(type),
                        _ks_groups = typedGroups[1];

                    type = typedGroups[0];

                    if (_ks_groups) {
                        _ks_groups = _Utils.getGroupsRe(_ks_groups);
                        eventData._ks_groups = _ks_groups;
                    }

                    // default bubble true
                    // if bubble false, it must has customEvent structure set already
                    customEvent = ObservableCustomEvent.getCustomEvent(self, type);

                    // optimize performance for empty event listener
                    if (!customEvent && !hasTargets) {
                        return;
                    }

                    if (customEvent) {

                        if (!customEvent.hasObserver() && !customEvent.defaultFn) {

                            if (customEvent.bubbles && !hasTargets || !customEvent.bubbles) {
                                return;
                            }

                        }

                    } else {
                        // in case no publish custom event but we need bubble
                        // because bubbles defaults to true!
                        customEvent = new ObservableCustomEvent({
                            currentTarget: self,
                            type: type
                        });
                    }

                    r2 = customEvent.fire(eventData);

                    if (ret !== false) {
                        ret = r2;
                    }

                });

                return ret;
            },

            /**
             * @ignore
             */
            publish: function (target, type, cfg) {
                var customEvent;

                splitAndRun(type, function (t) {
                    customEvent = ObservableCustomEvent.getCustomEvent(target, t, 1);
                    S.mix(customEvent, cfg)
                });

                return target;
            },

            getCustomEvent:function(target,type,create){
                return ObservableCustomEvent.getCustomEvent(target,type,create);
            },

            /**
             * @ignore
             */
            addTarget: function (target, anotherTarget) {
                var targets = api.getTargets(target);
                if (!S.inArray(anotherTarget, targets)) {
                    targets.push(anotherTarget);
                }
                return target;
            },

            /**
             * @ignore
             */
            removeTarget: function (target, anotherTarget) {
                var targets = api.getTargets(target),
                    index = S.indexOf(anotherTarget, targets);
                if (index != -1) {
                    targets.splice(index, 1);
                }
                return target;
            },

            /**
             * @ignore
             */
            getTargets: function (target, readOnly) {
                if (!readOnly) {
                    target[KS_BUBBLE_TARGETS] = target[KS_BUBBLE_TARGETS] || [];
                }
                return target[KS_BUBBLE_TARGETS];
            },

            /**
             * @ignore
             */
            on: function (target, type, fn, context) {
                type = trim(type);
                _Utils.batchForType(function (type, fn, context) {
                    var cfg = _Utils.normalizeParam(type, fn, context),
                        customEvent;
                    type = cfg.type;
                    customEvent = ObservableCustomEvent.getCustomEvent(target, type, 1);
                    if (customEvent) {
                        customEvent.on(cfg);
                    }
                }, 0, type, fn, context);
                return target; // chain
            },

            /**
             * @ignore
             */
            detach: function (target, type, fn, context) {
                type = trim(type);
                _Utils.batchForType(function (type, fn, context) {
                    var cfg = _Utils.normalizeParam(type, fn, context),
                        customEvents,
                        customEvent;
                    type = cfg.type;
                    if (type) {
                        customEvent = ObservableCustomEvent.getCustomEvent(target, type, 1);
                        if (customEvent) {
                            customEvent.detach(cfg);
                        }
                    } else {
                        customEvents = ObservableCustomEvent.getCustomEvents(target);
                        S.each(customEvents, function (customEvent) {
                            customEvent.detach(cfg);
                        });
                    }
                }, 0, type, fn, context);

                return target; // chain
            }
        });

    /**
     * Fire a custom event by name.
     * The callback functions will be executed from the context specified when the event was created,
     * and the {@link KISSY.Event.CustomEventObject} created will be mixed with eventData
     * @method fire
     * @param {String} type The type of the event
     * @param {Object} [eventData] The data will be mixed with {@link KISSY.Event.CustomEventObject} created
     * @return {*} If any listen returns false, then the returned value is false. else return the last listener's returned value
     */

    /**
     * Creates a new custom event of the specified type
     * @method publish
     * @param {String} type The type of the event
     * @param {Object} cfg Config params
     * @param {Boolean} [cfg.bubbles=true] whether or not this event bubbles
     * @param {Function} [cfg.defaultFn] this event's default action
     * @chainable
     */

    /**
     * Registers another EventTarget as a bubble target.
     * @method addTarget
     * @param {KISSY.Event.Target} anotherTarget Another EventTarget instance to add
     * @chainable
     */

    /**
     * Removes a bubble target
     * @method removeTarget
     * @param {KISSY.Event.Target} anotherTarget Another EventTarget instance to remove
     * @chainable
     */

    /**
     * all targets where current target's events bubble to
     * @private
     * @method getTargets
     * @return {Array}
     */

    /**
     * Subscribe a callback function to a custom event fired by this object or from an object that bubbles its events to this object.
     * @method on
     * @param {String} type The name of the event
     * @param {Function} fn The callback to execute in response to the event
     * @param {Object} [context] this object in callback
     * @chainable
     */

    /**
     * Detach one or more listeners from the specified event
     * @method detach
     * @param {String} type The name of the event
     * @param {Function} [fn] The subscribed function to un-subscribe. if not supplied, all observers will be removed.
     * @param {Object} [context] The custom object passed to subscribe.
     * @chainable
     */
}, {
    requires: ['./api', 'event/base', './observable']
});
/*
 yiminghe: 2012-10-24
 - implement defaultFn for custom event

 yiminghe: 2011-10-17
 - implement bubble for custom event
 */