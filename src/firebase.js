import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const apiKey = process.env.VUE_APP_FIREBASE_KEY;
const authDomain = `${process.env.VUE_APP_FIREBASE_PROJECTID}.firebaseapp.com`;
const databaseURL = `https://${process.env.VUE_APP_FIREBASE_PROJECTID}.firebaseio.com`;
const projectId = process.env.VUE_APP_FIREBASE_PROJECTID;
const storageBucket = `${process.env.VUE_APP_FIREBASE_PROJECTID}.appspot.com`;
const messagingSenderId = process.env.VUE_APP_FIREBASE_MESSAGESENDERID;

const config = {
  apiKey,
  authDomain,
  databaseURL,
  projectId,
  storageBucket,
  messagingSenderId
};

firebase.initializeApp(config);

// To remove firebase warning when trying to add record
// Using Cloud Firestore
const firestore = firebase.firestore();
const settings = {
  /* your settings... */
};
firestore.settings(settings);

export default firebase;

export function onAuthenticationChanged() {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged(
      user => {
        resolve(user);
        return;
      },
      error => {
        reject(error);
      }
    );
  });
}

export function getUser() {
  return firebase.auth().currentUser;
}

export function signupUser({ email, password }) {
  return new Promise((resolve, reject) => {
    const createdUser = firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    createdUser
      .then(user => {
        resolve(user);
        return;
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function signInUser({ email, password }) {
  return new Promise((resolve, reject) => {
    const authenticatedUser = firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    authenticatedUser
      .then(user => {
        resolve(user);
        return;
      })
      .catch(error => {
        reject(error);
      });
  });
}

const userModel = ({ user }) => {
  const provider = user.providerData[0].providerId;
  const { uid, displayName, email, phoneNumber, photoURL } = user;
  return { uid, displayName, email, phoneNumber, photoURL, provider };
};

export function addUser(user) {
  return new Promise((resolve, reject) => {
    // Using Cloud Firestore
    const createUser = userModel(user);
    const userDoc = firebase
      .firestore()
      .collection("users")
      .doc(user.user.uid)
      .set(createUser, { merge: true });

    userDoc
      .then(() => {
        resolve(user);
      })
      .catch(error => {
        reject(error);
      });
    // Example using Realtimedatabase
    // firebase
    //   .database()
    //   .ref("users")
    //   .child(user.user.uid)
    //   .set(userModel(user))
    //   .then(data => {
    //     resolve(data);
    //     return;
    //   })
    //   .catch(error => {
    //     reject(error);
    //   });
  });
}

export function fetchUser(user) {
  return new Promise((resolve, reject) => {
    var userRef = firebase
      .firestore()
      .collection("users")
      .doc(user.uid);
    userRef
      .get()
      .then(doc => {
        if (!doc.exists) {
          resolve(null);
        } else {
          resolve(doc.data());
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function signOutUser() {
  return new Promise((resolve, reject) => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        resolve(true);
        return;
      })
      .catch(error => {
        reject(error);
      });
  });
}

/*****************
Social logins
******************/

function getProvider({ provider }) {
  switch (provider) {
    case "GITHUB":
      return new firebase.auth.GithubAuthProvider();
    case "FACEBOOK":
      return new firebase.auth.FacebookAuthProvider();
    case "TWITTER":
      return new firebase.auth.TwitterAuthProvider();
    case "GOOGLE":
      return new firebase.auth.GoogleAuthProvider();
    default:
      console.error(`No provider found for ${provider}`); // eslint-disable-line
      break;
  }
}

export function signInWithSocial({ provider, isMobile = false }) {
  // TODO: Validate the type of device redirect is preffered on mobile
  return new Promise((resolve, reject) => {
    const useMobileLogin = isMobile;
    var firebaseProvider = getProvider({ provider });

    if (useMobileLogin) {
      firebase.auth().signInWithRedirect(firebaseProvider);
      firebase
        .auth()
        .getRedirectResult()
        .then(function(result) {
          if (result.credential) {
            // This gives you a Access Token. You can use it to access the API.
            var token = result.credential.accessToken;
            // ...
          }
          // The signed-in user info.
          var user = result.user;
          resolve({ user, token });
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          reject({ errorCode, errorMessage, email, credential });
        });
    } else {
      firebase
        .auth()
        .signInWithPopup(firebaseProvider)
        .then(function(result) {
          // This gives you a Access Token. You can use it to access the API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          resolve({ user, token });
        })
        .catch(function(error) {
          reject(error);
        });
    }
  });
}
