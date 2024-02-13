// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

//Imports
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


/**
 * @title 
 * @author 
 * @notice 
 * @notice 
 * @dev 
 */
contract MyCoin is ERC20,Ownable{

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      ATRIBUTOS
     * -----------------------------------------------------------------------------------------------------
     */

    //se genera un getter ya que es public
    uint8 public decimal;

    bool public status = true;  

    //true esta desactivado, false esta activado
    mapping(address => bool) public blacklist;    

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      CONSTRUCTOR
     * -----------------------------------------------------------------------------------------------------
     */

    constructor(uint256 _initialSupply, uint8 _decimal) ERC20("MyCoin","MYC"){
        _mint(msg.sender,_initialSupply);
        decimal=_decimal;
    }

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      ERRORS
     * -----------------------------------------------------------------------------------------------------
     */

    /**
     * Los errores son lanzados mediante la instruccion revert, normalmente despues de comprobar una condicion.
     * El nombre del error explica cual es el motivo por el se ha revertido la transaccion. 
     * Para mas informacion, buscar la condicion en la que se lanza el error.
     */

    error BalanceInsuficiente(address sender, uint256 value);

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      MODIFIERS
     * -----------------------------------------------------------------------------------------------------
     */

    modifier checkBalance(uint256 _value){
        uint256 actualBalance = getBalance(msg.sender);
        if(actualBalance < _value){
            revert BalanceInsuficiente(msg.sender, _value);
            require(true, "No tiene saldo suficiente la direccion esta");
        }
        _;
    }

    modifier allowTransfers() {
        require(status, "Transfers are not allowed");
        _;
    }

    modifier allowTransfersAccount(address _account){
        require(!blacklist[_account], "Account is not allowed");
        _;
    }

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      EVENTS
     * -----------------------------------------------------------------------------------------------------
     */

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      FUNCIONES
     * -----------------------------------------------------------------------------------------------------
     */

    function getBalance(address _account) public view returns(uint256){
        uint256 balance = balanceOf(_account);
        return balance;
    }

    function doTransfer(address _to, uint256 _value) public allowTransfers allowTransfersAccount(msg.sender) returns(bool){
        bool result = transfer(_to, _value);
        return result;
    }

    function decimals() public pure override returns(uint8){
        return 2;
    }

    function setDecimals(uint8 _decimal) public onlyOwner returns(uint8){
        decimal = _decimal;
        return decimal;
    }

    //function to swap from "ON" to "OFF"
    function switcher() public onlyOwner returns (bool){
        if(status){
            status = false;
        }else{
            status = true;
        }
        return status;
    }

    function switcherAccount(address _account) public onlyOwner returns(bool){
        if(blacklist[_account]){
            blacklist[_account] = false;
        }else{
            blacklist[_account] = true;
        }
        return blacklist[_account];
    }

    /**
     * Mintea nuevos tokens que va a recibir una direccion 
     * @param _amount cantidad de tokens que se van a mintear
     * @param _receiver address de quien va a recibir los tokens
     */
    function mintNewTokens(uint256 _amount, address _receiver) public onlyOwner{
        _mint(_receiver,_amount);
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
}