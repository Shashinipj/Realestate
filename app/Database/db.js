import Firebase from 'firebase';

 let config = {
    // apiKey: "AIzaSyAZoqObbC8SQeJ1uPjxLPfgk_AvF-E_MFc",
    // authDomain: "realestate-be70e.firebaseapp.com",
    // databaseURL: "https://realestate-be70e.firebaseio.com",
    // projectId: "realestate-be70e",
    // storageBucket: "gs://realestate-be70e.appspot.com/",
    // messagingSenderId: "1093883421506",

    apiKey: "AIzaSyChsVslULys7fgAM5NOsb-0J3GagZjUJvE",
    authDomain: "realstatedb-2adc9.firebaseapp.com",
    databaseURL: "https://realstatedb-2adc9.firebaseio.com",
    projectId: "realstatedb-2adc9",
    storageBucket: "realstatedb-2adc9.appspot.com",
    messagingSenderId: "600562295208",
    appId: "1:600562295208:web:27cd9b26adfc4f29"

  };

let app = Firebase.initializeApp(config);

export const db = app.database();
export const fbStorage = app.storage();