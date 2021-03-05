//setting web3 provider on page load, and if it's present then loading data from blockchain
window.addEventListener("load", async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    try {
      await ethereum.enable();
    } catch (error) {
      if (error.code === 4001) {
        alert("Request to access account denied!");
      }
    }
    //loading data from blockchain even if user has denied metamask account access
    loadBlockchainData();
  } else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
    loadBlockchainData();
  } else {
    alert(
      "Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!"
    );
  }
});

var contract;
var userAddress;
var pricePerToken;

//below event will be fired by metamask when user has changed it's metamask account
ethereum.on("accountsChanged", function (accounts) {
  userAddress = accounts[0];
  yourProfile();
});

const contractAddress = "0xAe273C81Fb0614250F24913eDa120FaA84c8E3ec";
const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "buyTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "candidateCounter",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    name: "candidateDetails",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "id",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "votes",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "etherBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pricePerToken",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenSold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_id",
        type: "uint8",
      },
    ],
    name: "totalVotes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_id",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "numberOfTokens",
        type: "uint256",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "votePerCandidate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "voterTokenBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "voterTotalTokenPurchased",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
const loadBlockchainData = function () {
  //creating contract instance
  contract = new web3.eth.Contract(abi, contractAddress);

  //fetching user current account
  web3.eth.getAccounts().then((accounts) => {
    userAddress = accounts[0];
    //reload user profile when address is changed
    yourProfile();
  });

  //loading token details from blockchain
  fetchTokensInfo();

  //fetching candidate name and votes from blockchain and displaying it on our web browser, also displaying drop down list
  contract.methods
    .candidateCounter()
    .call()
    .then((candidateCounter) => {
      for (let i = 0; i < candidateCounter; i++) {
        let candidateID = i + 1;
        contract.methods
          .candidateDetails(candidateID) //candidateDetails is a mapping which contains details of our candidate
          .call()
          .then((candidate) => {
            //candidate is a struct
            var newRow = document.getElementById("candidateResult").insertRow(); //inserting row in table body
            newRow.innerHTML =
              "<td>" + candidate.name + "</td><td>" + candidate.votes + "</td>"; //inserting cell data into the row I just created
            newRow.cells[1].setAttribute("id", candidateID); //setting id attribute in the second cell of newly added row, so that we can update candidates vote using it

            //defining options in the drop down list
            var option = document.createElement("OPTION"); //creating HTML option element
            option.innerHTML = candidate.name; //setting value of the option element
            option.setAttribute("value", candidateID); //adding value attribute in the option element & setting its value, to find out which candidate is voted
            document.getElementById("selectCandidate").appendChild(option); //adding option element into the HTML select element
          });
      }
    });
};

//this function is invoked inside loadBlockchainData function
function fetchTokensInfo() {
  //fetching total supply of tokens
  contract.methods
    .totalSupply()
    .call()
    .then((result) => {
      document.getElementById("totalSupply").innerHTML = result;
    });

  //fetching token balance
  contract.methods
    .tokenBalance()
    .call()
    .then((result) => {
      document.getElementById("tokenBalance").innerHTML = result;
    });

  //fetching amount of tokens sold
  contract.methods
    .tokenSold()
    .call()
    .then((result) => {
      document.getElementById("tokenSold").innerHTML = result;
    });

  //fetching token price in ether
  contract.methods
    .pricePerToken()
    .call()
    .then((result) => {
      //converting result(which is in wei) to ether
      pricePerToken = web3.utils.fromWei(result, "Ether");
      document.getElementById("pricePerToken").innerHTML =
        pricePerToken + " Ether";
    });

  //fetching amount of ether our contract have
  web3.eth.getBalance(contractAddress).then((result) => {
    document.getElementById("balance").innerHTML =
      web3.utils.fromWei(result, "Ether") + " Ether";
  });
}

//to display searched address details
function searchVoterInfo() {
  //to reset displaySearchInfo div, otherwise it will append new search result with old search result
  document.getElementById("displaySearchInfo").innerHTML = "";

  let searchAddress = document.getElementById("voterAddress").value;

  //if address is not valid then throw error
  if (!web3.utils.isAddress(searchAddress)) {
    alert("Invalid address");
  } else {
    contract.methods
      .candidateCounter()
      .call()
      .then((candidateCounterResult) => {
        //we got the count of total candidates participating
        contract.methods
          .voterTotalTokenPurchased(searchAddress)
          .call()
          //we got total number of tokens voter has purchased
          .then((voterTotalTokenResult) => {
            //creating a paragraph element
            let p = document.createElement("P");

            //displaying searched address
            p.innerHTML = "Searched address: " + searchAddress;
            document.getElementById("displaySearchInfo").appendChild(p);

            //creating a paragraph element again
            let p1 = document.createElement("P");

            //now displaying total tokens bought by a user
            p1.innerHTML = "Total Tokens Purchased: " + voterTotalTokenResult;
            document.getElementById("displaySearchInfo").appendChild(p1);

            //if voter has not purchased any tokens
            if (voterTotalTokenResult == 0) {
              let p2 = document.createElement("P");
              p2.innerHTML = "No tokens have been purchased by this address. ";
              document.getElementById("displaySearchInfo").appendChild(p2);
            } else {
              let p2 = document.createElement("P");
              p2.innerHTML = "Vote Cast Per Candidate:";
              document.getElementById("displaySearchInfo").appendChild(p2);
              //to display total number of votes a voter has given to a particular candidate
              for (let i = 0; i < candidateCounterResult; i++) {
                let candidateID = i + 1;
                contract.methods
                  .votePerCandidate(searchAddress, i)
                  .call()
                  .then((votePerCandidateResult) => {
                    contract.methods
                      .candidateDetails(candidateID)
                      .call()
                      .then((candidateDetailsResult) => {
                        let p3 = document.createElement("P");
                        p3.innerHTML =
                          candidateDetailsResult.name +
                          ": " +
                          votePerCandidateResult;
                        document
                          .getElementById("displaySearchInfo")
                          .appendChild(p3);
                      });
                  });
              }
            }
          });
      });
  }

  //resetting input field with id "voterAddress"
  document.getElementById("voterAddress").value = "";
}

function buyTokens() {
  //storing user input of tokens to buy and converting it into number
  let tokensToBuy = Number(document.getElementById("tokensToBuy").value);

  //if user input is a positive integer greater than 0 then proceed
  if (tokensToBuy > 0 && Number.isInteger(tokensToBuy)) {
    //this will give us price in ether
    let tokenPrice = tokensToBuy * pricePerToken;

    //converting to string because utils.toWei accept string
    tokenPrice = tokenPrice.toString();

    contract.methods
      .buyTokens()
      .send({
        from: userAddress,
        value: web3.utils.toWei(tokenPrice, "Ether"), //converting token price from ether to wei
        gasLimit: web3.utils.toHex(3000000),
      })
      .then(() => {
        fetchTokensInfo();
        yourProfile();
      })
      .catch((err) => {
        if (err.code == 4001) {
          alert("Transaction signature denied!");
        }
      });
  } else {
    alert("Invalid input");
  }

  //resetting input field
  document.getElementById("tokensToBuy").value = "";
}

function vote() {
  let candidateID = document.getElementById("selectCandidate").value;

  //storing user input of number of tokens to vote and converting it into number
  let numberOfTokens = Number(document.getElementById("numberOfTokens").value);

  //if he has not selected any candidate then alert
  if (candidateID == 0) {
    alert("Please select a candidate");
  }
  //if user input of number of tokens to vote is a positive integer greater than 0 then proceed
  else if (numberOfTokens > 0 && Number.isInteger(numberOfTokens)) {
    contract.methods
      .vote(candidateID, numberOfTokens)
      .send({ from: userAddress, gasLimit: web3.utils.toHex(3000000) })
      .then(() => {
        contract.methods
          .totalVotes(candidateID)
          .call()
          .then((result) => {
            document.getElementById(candidateID).innerHTML = result;
          });
        yourProfile();
      })
      .catch((err) => {
        if (err.code == 4001) {
          alert("Transaction signature denied!");
        }
      });
  } else {
    alert("Please enter valid number of tokens");
  }

  //resetting form
  document.getElementById("voteForm").reset();
}

//to display current user data
function yourProfile() {
  document.getElementById("userAddress").innerText = "Address: " + userAddress;
  contract.methods
    .candidateCounter()
    .call()
    .then((candidateCounterResult) => {
      //we got the count of total candidates participating
      contract.methods
        .voterTotalTokenPurchased(userAddress)
        .call()
        //we got total number of tokens voter has purchased
        .then((voterTotalTokenResult) => {
          document.getElementById("displayVoterInfo").innerHTML = "";
          //creating a paragraph element
          let p = document.createElement("P");

          //now displaying total tokens bought by a user
          p.innerHTML = "Total Tokens Purchased: " + voterTotalTokenResult;
          document.getElementById("displayVoterInfo").appendChild(p);

          //if voter has not purchased any tokens
          if (voterTotalTokenResult == 0) {
            let p2 = document.createElement("P");
            p2.innerHTML = "You have not purchased any tokens.";
            document.getElementById("displayVoterInfo").appendChild(p2);
          } else {
            //displaying user token balance
            let p1 = document.createElement("P");
            contract.methods
              .voterTokenBalance(userAddress)
              .call()
              .then((result) => {
                p1.innerHTML = "Token Balance: " + result;
                document.getElementById("displayVoterInfo").appendChild(p1);
                let p2 = document.createElement("P");
                p2.innerHTML = "Vote Cast Per Candidate:";
                document.getElementById("displayVoterInfo").appendChild(p2);
                for (let i = 0; i < candidateCounterResult; i++) {
                  let candidateID = i + 1;
                  contract.methods
                    .votePerCandidate(userAddress, i)
                    .call()
                    .then((votePerCandidateResult) => {
                      contract.methods
                        .candidateDetails(candidateID)
                        .call()
                        .then((candidateDetailsResult) => {
                          let p3 = document.createElement("P");
                          p3.innerHTML =
                            candidateDetailsResult.name +
                            ": " +
                            votePerCandidateResult;
                          document
                            .getElementById("displayVoterInfo")
                            .appendChild(p3);
                        });
                    });
                }
              });
          }
        });
    });
}
