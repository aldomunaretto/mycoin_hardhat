// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

//Imports
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyNFTCollection Smart Contract
 * @author David González López
 * @notice Este contrato es para crear una colección de NFTs personalizada
 * @dev Extiende de los SC ERC721 y Ownable de OpenZeppelin para manejar la propiedad y funcionalidades de NFTs.
 */
contract MyNFTCollection is ERC721, Ownable{

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      ATRIBUTOS
     * -----------------------------------------------------------------------------------------------------
     */

    /// @notice Contador de IDs de tokens, utilizado para asignar IDs únicos a los NFTs.
    uint256 public tokenIdCounter = 0;


    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      CONSTRUCTOR
     * -----------------------------------------------------------------------------------------------------
     */


    /// @notice Inicializa el contrato recibiendo dos parámetros.
    /// @param _name Nombre de la colección de NFT.
    /// @param _symbol Símbolo de la colección de NFT.
    constructor(string memory _name, string memory _symbol)ERC721(_name, _symbol){}

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

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      MODIFIERS
     * -----------------------------------------------------------------------------------------------------
     */

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


    /// @notice Incrementa el contador de IDs de token y lo retorna.
    /// @return uint256 El siguiente ID de token.
    function incrementCounter() internal returns(uint256){
        // Incrementa el contador de tokens
        tokenIdCounter++;
        // Devuelve el el valor del contador de tokens
        return tokenIdCounter;
    }

    /// @notice Función para crear un nuevo NFT y asignarlo a la dirección que llama a la función.
    /// @return uint256 El ID del nuevo NFT.
    function mintNewToken() public returns(uint256){
        // Ejecuta la función incrementCounter y guarda el valor devuelto en la variable tokenId
        uint256 tokenId = incrementCounter(); 
        // Crea un nuevo NFT con el ID tokenId y lo asigna a la dirección que llama a la función
        _mint(msg.sender, tokenId);
        // Devuelve el ID del nuevo NFT
        return tokenId;
    }

    /// @notice Función para transferir un NFT a otra dirección.
    /// @param _to Dirección a la que se va a transferir el NFT.
    /// @param _tokenId ID del NFT que se va a transferir.
    function doTransfer(address _to, uint256 _tokenId) public {
        // Utiliza la función safeTransferFrom de OpenZeppelin para transferir el NFT con ID _tokenId a la dirección _to desde la dirección que llama a la función.
        safeTransferFrom(msg.sender, _to, _tokenId);
    }

    /// @notice Función para consultar el propietario de un NFT.
    /// @param _tokenId ID del NFT del que se quiere consultar el propietario.
    /// @return address Dirección del propietario del NFT.
    function ownerOfToken(uint256 _tokenId) public view returns(address){
        // Utiliza la función ownerOf de OpenZeppelin para consultar el propietario del NFT con ID _tokenId.
        address owner = ownerOf(_tokenId);
        // Devuelve la dirección del propietario del NFT
        return owner;
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
}