pragma solidity ^0.6.0;

contract Voting {
    //To store canidate data
    struct Candidate {
        string name;
        uint8 id;
        uint256 votes;
    }
    
    /*Note: If a state variable is declared as public, a function to read its value will be automatically created by the compiler*/
    uint256 public totalSupply;
    uint256 public tokenSold;
    uint256 public tokenBalance;
    uint256 public pricePerToken;

    //To store and fetch candidate details
    mapping(uint8 => Candidate) public candidateDetails;

    //To keep count of candidates
    uint8 public candidateCounter;

    mapping(address => uint256) public voterTokenBalance;
    mapping(address => uint256) public voterTotalTokenPurchased;
    mapping(address => uint256[]) public votePerCandidate;

    constructor() public {
        addCandidate("Hammad");
        addCandidate("Arsalan");
        addCandidate("Ukkasha");
        addCandidate("Abdullah");
        addCandidate("Nabeel");
        totalSupply = 10000;
        tokenBalance = totalSupply;
        tokenSold = 0;
        pricePerToken = 0.1 ether;
    }

    receive() external payable {
        buyTokens();
    }

    function buyTokens() public payable {

        //To get total tokens voter wants to buy
        uint256 numberOfTokens = msg.value / pricePerToken;

        //To check whether we have enough tokens or no
        require(tokenBalance >= numberOfTokens, "We do not have enough tokens");

        //To keep record of total tokens purchased by a voter
        voterTotalTokenPurchased[msg.sender] =
            voterTotalTokenPurchased[msg.sender] +
            numberOfTokens;

        //To keep record of token balance of a voter
        voterTokenBalance[msg.sender] =
            voterTokenBalance[msg.sender] +
            numberOfTokens;

        tokenSold = tokenSold + numberOfTokens; //updaing total number of tokens sold
        tokenBalance = totalSupply - tokenSold; //updating total token balance
        
               //Assigning 0 as a default value of votes given by a particular voter to all candidates
        if (votePerCandidate[msg.sender].length == 0) {
            for (uint8 i = 0; i < candidateCounter; i++) {
                votePerCandidate[msg.sender].push(0);
            }
        }
    }

    function etherBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function addCandidate(string memory _name) private {
        candidateCounter++;
        candidateDetails[candidateCounter] = Candidate(
            _name,
            candidateCounter,
            0
        );
    }

    function vote(uint8 _id, uint256 numberOfTokens)
        public
    {
        //checking whether voter has enough tokens to vote
        require(
            voterTokenBalance[msg.sender] >= numberOfTokens,
            "You do not have enough tokens"
        );

        //update candidate votes
        candidateDetails[_id].votes += numberOfTokens;

        //subtracting voters token
        voterTokenBalance[msg.sender] -= numberOfTokens;


        /*keeping a record of how many votes a voter has given to a particular candidate
        _id-1 will give us the index where we are supposed to keep record of total votes given by a voter to a particular candidate
        In our example, id of candidate Hammad is 1, so we are suppoed to store votes casted to Hammad by a particular voter at index 0*/
        votePerCandidate[msg.sender][_id - 1] += numberOfTokens;
    }

    function totalVotes(uint8 _id)
        public
        view
        returns (uint256)
    {
        return candidateDetails[_id].votes;
    }
}
