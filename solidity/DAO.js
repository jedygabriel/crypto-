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

	//modificador que permite apenas acionistas votarem e fazerem novas propostas
	modifier onlyMembers {
		if (memberId[msg.sender] == 0)
		|| !members[memberId[msg.sender]].canVote)
		throw;
		_
	}

	//Iniciando pela primeira vez
	function Congress(uint minimumQuorumForProposals, uint minutesForDebate, int marginOfVotesForMajority, address congrssLeader) {
		minimumQuorum = minimumQuorumForProposals;
		debatingPeriodInMinutes = minutesForDebate;
		majorityMargin = marginOfVotesForMajority;
		members.length++;; 
		members[0] = Member({member: 0, canVote: fals, memberSince: now, name: ''});
		if (congressLeader != 0) owner = congressLeader;

	}

	//fazer um novo membro
	function changeMembership(address targetMember, bool canVote, string memberName) onlyOwner {
		uint id;
		if (memberId[targetMember] == 0) {

			memberId[targetMember] = members.length;
			id = members.length++;
			members[id] = Member({member: targetMember, canVote: canVote, memberSince: now, name: memberName});
		}
		else{
			id = memberId[targetMember];
			Member m = members[id];
			m.canVote = canVote;
		}

		MembershipChanged(targetMember, canVote);

	}

	//para mudar as regras
	function changeVotingRules(uint minimumQuorumForProposals, uint minutesForDebate, int marginOfVotesForMajority) onlyOwner {
		minimumQuorum = minimumQuorumForProposals;
		debatingPeriodInMinutes = minutesForDebate;
		majorityMargin = marginOfVotesForMajority;

		ChangeOfRules(minimumQuorum, debatingPeriodInMinutes, majorityMargin);

	}


		//str.replace(/[aeiou]/gi, '');

  	 //Função para criar uma nova proposta //
  	 function newProposal(address beneficiary, uint etherAmount, string JobDescription, bytes transactionBytecode) onlyMembers returns (uint proposalID) {
  	 	proposalID = proposals.length++;
  	 	Proposal p = proposals[proposalID];
  	 	p.recipient = beneficiary;
  	 	p.amount = etherAmount;
  	 	p.description = JobDescription;
  	 	p.proposalHash = sha3(beneficiary, etherAmount, transactionBytecode);
  	 	p.votingDeadLine = now + debatingPeriodInMinutes * 1 minutes;
  	 	p.executed = false;
  	 	p.proposalPassed = false;
  	 	p.numberOfVotes = 0;
  	 	ProposalAdded(proposalID, beneficiary, etherAmount, JobDescription);
  	 	numProposals = proposalID+1;

  	 }

  	 //função pra checar se o código da proposta bate
  	 function checkProposalCode(uint proposalNumber, address beneficiary, uint etherAmount, bytes transactionBytecode) constant returns (bool codeChecksOut) {
  	 	Proposal p = proposals[proposalNumber];
  	 	return p.proposalHash == sha3(beneficiary, etherAmount, transactionBytecode);

  	 }

  	 function vote(uint proposalNumber, bool supportsProposal, string justificationText) onlyMembers returns (uint voteID) {
  	 	Proposal p = proposals[proposalNumber];
  	 	if(p.voted[msg.sender] == true) throw;
  	 	p.voted[msg.sender] = true;
  	 	p.numberOfVotes++;
  	 	if (supportsProposal) {
  	 		p.currentResult++;
  	 		  	 	}
  	 else {
  	 	p.currentResult--;
  	 }

  	 //Cria um log do eventos
  	 Voted(proposalNumber, supportsProposal, msg.sender, justificationText);

  	 }

  	 function executeProposal(uint proposalNumber, bytes transactionBytecode) returns (int result) {
  	 	Proposal p = proposals[proposalNumber];
  	 	//Checa se a proposta pode ser executada
  	 	if (now < p.votingDeadLine)
  	 	|| p.executed
  	 	|| p.proposalHash != sha3(p.recipient, p.amount, transactionBytecode)
  	 	|| p.numberOfVotes < minimumQuorum)
		throw;

		//Executa o resultado
		if (p.currentResult > majorityMargin) {
			//Se a diferença entre o suporte e a oposição for menor que a margem 
		p.recipient.call.value(p.amount * 1 ether)(transactionBytecode);
		p.executed = true;
		p.proposalPassed = true;

		} else {
			p.executed = true;
			p.proposalPassed = false;
		}

		//Dispara os eventos
		ProposalTallied(proposalNumber, p.currentResult, p.numberOfVotes, p.proposalPassed);

  	 }

}
