pragma solidity >=0.4.25 <0.6.0;

contract Identity
{
    address owner;
    
    struct User
    {
        address id;
        string name;
        string age;
        string dob;
        string file1;
        string file2;
    }
    
    mapping(address => User) public users;
    constructor() public
    {
        // Smart contract owner
        owner = msg.sender;
    }
    
    function checkUserIsPresentOrNot() public view returns(uint)
    {
        if(users[msg.sender].id == msg.sender)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    }

    function addUser(
        string memory _name,
        string memory _age, 
        string memory _dob, 
        string memory _file1, 
        string memory _file2
    ) public payable
    {
        User memory newUser;
        newUser.id = msg.sender;
        newUser.name = _name;
        newUser.age = _age;
        newUser.dob = _dob;
        newUser.file1 = _file1;
        newUser.file2 = _file2;
        users[msg.sender] = newUser;
    }
    
    function viewOwnUserDetails()
        public view returns(
            address,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        return (users[msg.sender].id,users[msg.sender].name, users[msg.sender].age, users[msg.sender].dob,users[msg.sender].file1,users[msg.sender].file2);
    }
    
    function viewOtherUserDetails(address _address) public view returns(address,string memory, string memory,string memory, string memory, string memory)
    {
        
        return (users[_address].id,users[_address].name, users[_address].age, users[_address].dob,users[_address].file1,users[_address].file2);
    }
    
    function updateDetails(string memory _name, string memory _age, string memory _dob, string memory _file1, string memory _file2) public payable returns(string memory)
    {
        // Ussr can update its own details only and each call to this function is payable
        if(users[msg.sender].id==msg.sender)
        {
            // User is registered and can update own details
            users[msg.sender].name = _name;
            users[msg.sender].age = _age;
            users[msg.sender].dob = _dob;
            users[msg.sender].file1 = _file1;
            users[msg.sender].file2 = _file2;
            return "User successfully updated";
        }
        else
        {
            return "User is not registered";
        }
    }
}