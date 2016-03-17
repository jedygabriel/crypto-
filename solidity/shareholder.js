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
	
	}


}