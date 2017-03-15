/**
 * Pid model events
 */

'use strict';

import {EventEmitter} from 'events';
import Pid from './pid.model';
var PidEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PidEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Pid.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    PidEvents.emit(event + ':' + doc._id, doc);
    PidEvents.emit(event, doc);
  }
}

export default PidEvents;
