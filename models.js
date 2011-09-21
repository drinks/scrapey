var uuid = require('uuid-lib');

function getId(){
  return uuid.create().value;
}

module.exports.User = function(mongoose){
  var Schema = mongoose.Schema
   ,  User = new Schema({
          email: { type: String, match: /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/, unique: true}
        , key: { type: String, default: getId, index: true }
        , activated: { type: Boolean, default: false, index: true }
        , activation_hash: { type: String, default: getId, index: true }
        , created_at: { type: Date, default: Date.now }
      });
  return mongoose.model('User', User);
}
