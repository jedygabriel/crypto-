contract owned {
	address public owner;

	function owned() {
		owner = msg.sender;
	}

	modifier onlyOwner {
		if (msg.sender != owner) throw;
		_
	}

	function transferOwnership(address newOwner) onlyOwner {
		owner = newOwner;
	}
}

contract Congress is owned {
	//Variaveis do contrato e dos eventos
	uint public minimumQuorum;
	uint public debatingPeriodInMinutes;
	int public majorityMargin;
	Proposal[] public proposals;
	uint public numProposals;
	mapping (address => uint) public memberId;
	Member[] public members;

	event ProposalAdded(uint proposalID, address recipient, uint amount, string description);
	event Voted(uint proposalID, bool position, address voter, string justification);
	event ProposalTallied(uint proposalID, int result, uint quorum, bool active);
	event MembershipChanged(address member, bool isMember);
	event ChangeofRules(uint minimumQuorum, uint debatingPeriodInMinutes, int majorityMargin);

	struct Proposal {

		address recipient;
		uint amount;
		string description;
		uint votingDeadline;
		bool executed;
		bool proposalPassed;
		uint numberOfVotes;
		int currentResult;
		bytes32 proposalHash;
		Vote[] votes;
		mapping (address => bool) voted;

	}

	struct Member {
		address member;
		bool canVote;
		string name;
		uint memberSince;
	}

	struct Vote{
		bool inSupport;
		address voter;
		string justification;
	}

	



}