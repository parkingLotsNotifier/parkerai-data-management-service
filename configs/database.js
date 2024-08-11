const mongoose = require(`mongoose`);

const connect = async (username,password,host)=>{
    const uri =`mongodb+srv://${username}:${password}@${host}?retryWrites=true&w=majority`;
    mongoose.connect(uri ,{ useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.set('strictQuery', true)
    console.log(`connected to database`);
};

module.exports={connect};
