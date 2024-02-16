// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

//Imports
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


/**
 * @title MyNFTCollection Smart Contract
 * @author David González López
 * @notice Implementa un token ERC20 personalizado con funcionalidades extendidas.
 * @dev Extiende de los SC ERC20 y Ownable de OpenZeppelin para manejar la propiedad y funcionalidades de NFTs.
 * @dev Incluye funcionalidades como cambio de decimales, activación/desactivación de transferencias, y manejo de lista negra.
 */
contract MyCoin is ERC20,Ownable{

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      ATRIBUTOS
     * -----------------------------------------------------------------------------------------------------
     */

    /// @notice Cantidad de decimales que tiene MyCoin.
    /// @dev Se genera un getter ya que es public.
    uint8 public decimal;

    /// @notice Estado del smart contract.
    /// @dev Si esta en true, las transferencias estan activadas, si esta en false, las transferencias estan desactivadas.
    bool public status = true;  

    /// @notice Mapping que contiene la lista negra de direcciones.
    /// @dev Si una direccion esta en true esta inhabilitado para hacer transferencias.
    mapping(address => bool) public blacklist;    

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      CONSTRUCTOR
     * -----------------------------------------------------------------------------------------------------
     */

    /// @notice Inicializa el contrato recibiendo dos parámetros.
    /// @param _initialSupply Cantidad inicial de tokens que se van a crear.    
    /// @param _decimal Cantidad de decimales que va a tener el token.  
    constructor(uint256 _initialSupply, uint8 _decimal) ERC20("MyCoin","MYC"){
        // Utilizamos la funcion _mint de ERC20 para crear la cantidad inicial de tokens.
        _mint(msg.sender,_initialSupply);
        // Asignamos el valor de decimales.
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

    /// @notice Error que se lanza cuando una direccion no tiene saldo suficiente para hacer una transferencia.
    /// @param sender Direccion que intenta hacer la transferencia.
    /// @param value Cantidad de tokens que intenta transferir.
    error BalanceInsuficiente(address sender, uint256 value);

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      MODIFIERS
     * -----------------------------------------------------------------------------------------------------
     */

    /// @notice Modificador que permite hacer transferencias si el estado del contrato es true.
    modifier allowTransfers() {
        require(status, "Transfers are not allowed");
        _;
    }

    /// @notice Modificador que permite hacer transferencias si la direccion no esta en la lista negra.
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

    /// @notice Funcion que devuelve el balance de una direccion.
    /// @param _account Direccion de la que se quiere saber el balance.
    /// @return balance saldo en MyCoin de la direccion.
    function getBalance(address _account) public view returns(uint256){
        // Llamamos a la funcion balanceOf de ERC20 para obtener el balance de la direccion.
        uint256 balance = balanceOf(_account);
        // Devolvemos el saldo.
        return balance;
    }

    /// @notice Funcion que permite hacer una transferencia de tokens.
    /// @dev Solo se puede hacer una transferencia si el estado del contrato es true y la direccion no esta en la lista negra.
    /// @dev Se utiliza los modificador allowTransfers y allowTransfersAccount para comprobar que se cumplan las condiciones.
    /// @param _to Direccion a la que se van a transferir los tokens.
    /// @param _value Cantidad de tokens que se van a transferir.
    /// @return result true si la transferencia ha sido exitosa, false si no.
    function doTransfer(address _to, uint256 _value) public allowTransfers allowTransfersAccount(msg.sender) returns(bool){
        // Llamamos a la funcion transfer de ERC20 para hacer la transferencia.
        bool result = transfer(_to, _value);
        // Devolvemos el resultado como booleano.
        return result;
    }

    /// @notice función que permite conocer el numero de decimales que tiene el token.
    /// @return decimal cantidad de decimales que tiene.
    function decimals() public view override returns(uint8){
        return decimal;
    }

    /// @notice Funcion que permite cambiar el numero de decimales que tiene el token.
    /// @dev Solo el propietario del contrato puede cambiar el numero de decimales.
    /// @param _decimal Nuevo numero de decimales que va a tener el token.
    /// @return Devuelve nuevo numero de decimales.
    function setDecimals(uint8 _decimal) public onlyOwner returns(uint8){
        // Asignamos el nuevo valor de decimales.
        decimal = _decimal;
        // Devolvemos el nuevo valor de decimales.
        return decimal;
    }

    /// @notice Funcion que permite activar o desactivar las transferencias en el smart contract.
    /// @dev Solo el propietario del contrato puede activar o desactivar las transferencias.
    /// @return Devuelve true si el contrato tiene las transferencias activas, y false en el caso contrario.
    function switcher() public onlyOwner returns (bool){
        // Comprobamos si el smart contract tiene las transferencias activas y las activamos o desactivamos segun corresponda.
        if(status){
            status = false;
        }else{
            status = true;
        }
        // Devolvemos el estado de las transferencias.
        return status;
    }

    /// @notice Funcion que permite añadir o quitar una direccion de la lista negra.
    /// @dev Solo el propietario del contrato puede añadir o quitar una direccion de la lista negra.
    /// @param _account Direccion que se va a añadir o quitar de la lista negra.
    /// @return Devuelve true si la direccion esta en la lista negra, false si no.
    function switcherAccount(address _account) public onlyOwner returns(bool){
        // Comprobamos si la direccion esta en la lista negra y la añadimos o quitamos segun corresponda.
        if(blacklist[_account]){
            blacklist[_account] = false;
        }else{
            blacklist[_account] = true;
        }
        // Devolvemos el estado de la direccion en la lista negra.
        return blacklist[_account];
    }

    /// @notice Mintea nuevos tokens que va a recibir una direccion 
    /// @dev Solo el propietario del contrato puede mintear nuevos tokens
    /// @param _amount cantidad de tokens que se van a mintear
    /// @param _receiver address de quien va a recibir los tokens
    function mintNewTokens(uint256 _amount, address _receiver) public onlyOwner{
        // Llamamos a la funcion _mint de ERC20 para mintear los tokens.
        _mint(_receiver,_amount);
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
}