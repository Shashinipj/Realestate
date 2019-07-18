import Firebase from 'firebase';

 let config = {
    apiKey: "AIzaSyAZoqObbC8SQeJ1uPjxLPfgk_AvF-E_MFc",
    authDomain: "realestate-be70e.firebaseapp.com",
    databaseURL: "https://realestate-be70e.firebaseio.com",
    projectId: "realestate-be70e",
    storageBucket: "gs://realestate-be70e.appspot.com/",
    messagingSenderId: "1093883421506",
  };

let app = Firebase.initializeApp(config);

export const db = app.database();