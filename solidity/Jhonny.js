contract mortal {
	//Define a variavel dono do tipo endereço
	address dono;

	//Essa função executa a inicialização e define o dono do contrato como quem mandou a msg do contrato.
	function mortal() {
		dono = msg.sender;
	}

	//Função para recuperar os fundos do contrato
	function kill() {
		if (msg.sender == owner) suicide(dono);
	}
}

<<<<<<< HEAD
contract cumprimentador mortal {
=======
contract cumprimentador is mortal {
>>>>>>> cb33f08a507878c136da7d31195da45d01b998e9

	//define a variavel cumprimento do tipo string
	string cumprimento;

	//Roda o cotrato quando executado
	function cumprimentador(string _cumprimento) public {
		cumprimento = _cumprimento;
	}

	//Main
	function cumprimentar() constant returns (string) {
		return cumprimento;
	}

}
