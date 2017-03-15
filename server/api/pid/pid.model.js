'use strict';

import mongoose from 'mongoose';

var PidSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('Pid', PidSchema);
