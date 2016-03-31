//O token que é usado como ação para votos
contract token { mapping (address => uint 256) public balanceOf; }

// Define o dono
contract owned {
	address public owner;

	function owned(){
		owner = msg.sender;
	}

	modifier onlyOwner {
		if (msg.sender != owner) throw;
	_
	}

	function transferOwnership(address newOwner) onlyOwner{
		owner = newOwner;
	}

	//Contrato da democracia
	contract Association is owned{

		//Variaveis e eventos do Contrato
		uint public minimumQuorum;
		uint public debatingPeriodInMinutes;
		Proposal[] public proposals;
		uint public numProposals;
		token public sharesTokenAddress;

		event ProposalAdded(uint proposalID, address recipient, uint amount, string description);
		event Voted(uint proposalID, bool position, address voter);
		event ProposalTallied(uint proposalId, int result, uint quorum, bool active);
		event ChangeOfRules(uint minimumQuorum, uint debatingPeriodInMinutes, address sharesTokenAddress);

		struct Proposal {
			address recipient;
			uint amount;
			string description;
			uint votingDeadLine;
			bool executed;
			bool proposalPassed;
			uint numberOfVotes;
			bytes32 proposalHash;
			Vote[] votes;
			mapping (address => bool) voted;
		}


		struct Vote{
			bool inSupport;
			address voter;
		}

		//modificador que permite apenas os shareholders votarem em novas propostas
		modifier onlyShareholders {
			if (sharesTokenAddress.balanceOf(msg.sender) == 0) throw;
			_
		}

		//Inicializando pela primeira vez
		function Association(token sharesAddress, uint minimumSharesToPassAVote, uint minutesForDebate) {
			sharesTokenAddress = token(sharesAddress);
			if (minimumSharesToPassAVote == 0 ) minimumSharesToPassAVote = 1;
			minimumQuorum = minimumSharesToPassAVote;
			debatingPeriodInMinutes = minutesForDebate;
		}

		//mudar as regras
		function changeVotingRules(token sharesAddress, uint minimumSharesToPassAVote, uint minutesForDebate) onlyOwner {
			sharesTokenAddress = token(sharesAddress);
			minimumQuorum = minimumSharesToPassAVote;
			debatingPeriodInMinutes = minutesForDebate;
			ChangeOfRules(minimumQuorum, debatingPeriodInMinutes, sharesTokenAddress);

		}

		//Função para criar novas propostas
		function newProposal(address beneficiary, uint etherAmount, string JobDescription, bytes transactionBytecode) onlyShareholders returns (uint proposalID) {
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

		//Função para checar se o código de uma proposta bate
		function checkProposalCode(uint proposalNumber, address beneficiary, uint etherAmount, bytes transactionBytecode) constant returns (bool codeChecksOut) {
			Proposal p = proposals[proposalNumber];
			return p.proposalHash == sha3(beneficiary, etherAmount, transactionBytecode);
		}

		function vote(uint proposalNumber, bool supportsProposal) onlyShareholders returns (uint voteID){
			Proposal p = proposals[proposalNumber];
			if (p.voted[msg.sender] == true) throw;

			voteID = p.votes.length++;
			p.votes[voteID] = Vote({inSupport: supportsProposal, voter: msg.sender});
			p.voted[msg.sender] = true;
			p.numberOfVotes = voteID +1;
			Voted(proposalNumber, supportsProposal, msg.sender);
		}

		function executeProposal(uint proposalNumber, bytes transactionBytecode) returns (int result) {
			Proposal p = proposals[proposalNumber];
			//Checa se a proposta pode ser executada
			if (now < p.votingDeadLine           /*A deadline já chegou?*/
				|| p.executed      // ja foi executada?
				|| p.proposalHash != sha3(p.recipient, p.amount, transactionBytecode)) //O código da transação bate com o da proposta?
				throw;

				//Zerar os votos
				uint quorum = 0;
				uint yea = 0;
				uint nay = 0;

				for(uint i = 0; i < p.votes.length; i++) {
					Vote v = p.votes[i];
					uint voteWeight = sharesTokenAddress.balanceOf(v.voter);
					quorum += voteWeight;
					if (v.inSupport) {
						yea += voteWeight;

					} else {
						nay += voteWeight;
					}
				}

				//executa o resultado
				if(quorum <= minimumQuorum) {
					//Não possui votadores suficientes
					throw;
				} else if(yea > nay ) {
					//possui a margem e foi aprovada
					p.recipient.call.value(p.amount * 1 ether)(transactionBytecode);
					p.executed = true;
					p.proposalPassed = true;

				} else {
					p.executed = true;
					p.proposalPassed = false;
				}

				//Disparar eventos
				ProposalTallied(proposalNumber, result, quorum, p.proposalPassed);
				



			}


	}


}