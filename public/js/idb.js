const { response } = require("express");
const { get } = require("mongoose");

//create the variableto hold DB connection
let db;
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new-transaction', { autoIncrement: true});
};

request.onsuccess = function (event) {
    deb = event.target.result;
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};
// save the data with no connection
function saveRecord(record) {
    const transaction =db.transaction(['new-transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new-transaction');
    budgetObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new-transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new-transaction');
    const getAll = budgetObjectStore.getAll();
        //send data to transaction api
        getAll.onsuccess = function () {
            if (getAll.result.length > 0) {
                fetch('/api/transaction', 
                {
                    method: 'POST',
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message){
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new-transaction'], 'readwrite');
                    const budgetObjectStore = transaction.objectStore('new-transaction');
                    budgetObjectStore.clear();

                    alert('All transactions have been entered!');
                })
                .catch(err => {
                    console.log(err);
                });
            }
        }
};