// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

//Imports
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IMyCoin} from "../ERC20/IMyCoin.sol";
import {IMyNFTCollection} from "../ERC721/IMyNFTCollection.sol";

/**
 * @title 
 * @author 
 * @notice 
 * @notice 
 * @dev 
 */
contract MyMarketPlace is Ownable{

    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      ATRIBUTOS
     * -----------------------------------------------------------------------------------------------------
     */

    //Referencia al contrato MyCoin
    IMyCoin MyCoinContract;
    //Referencia al contrato MyNFTCollection
    IMyNFTCollection MyNFTCollectionContract;

    //Contador para los id de las Sales
    uint256 public saleIdCounter = 0;

    //Estados posibles de una venta
    //https://docs.soliditylang.org/en/v0.8.19/types.html#enums
    enum SaleStatus {
        //Cuando se crea una venta el estado es Open
        Open,
        //Cuando se compra una venta el estado es Executed
        Executed,
        //Cuando se cancela una venta el estado es Cancelled
        Cancelled
    }

    //Contiene toda la informacion de una venta
    struct Sale{
        //Propietario del token y de la venta
        address owner;
        //Id del token ERC721 (NFT)
        uint256 tokenId;
        //Cantidad de tokens ERC20 que tiene que pagar el comprador
        uint256 price;
        //Estado de la venta
        SaleStatus status;
    }

    //Relaciona el id de la venta con el objeto Sale que contiene la informacion
    mapping(uint256 => Sale) public sales;



    /**
     * -----------------------------------------------------------------------------------------------------
     *                                      CONSTRUCTOR
     * -----------------------------------------------------------------------------------------------------
     */

    /**
     * Inicializa las referencias a los contratos. 
     * @dev Se pasan por parametro en la funcion deploy.
     * @param _ERC20Address address del contrato ERC20.
     * @param _ERC721Address address del contrato ERC721
     */
    constructor(address _ERC20Address, address _ERC721Address){
        MyCoinContract = IMyCoin(_ERC20Address);
        MyNFTCollectionContract = IMyNFTCollection(_ERC721Address);
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

    /**
     * Incrementa el valor del contador de id de ventas.
     * Es necesario llamarlo justo antes de crear una venta nueva para obtener el id de la venta.
     * Tomad como ejemplo de uso MyNFTCollection.
     */
    function incrementCounter() internal returns(uint256){
        saleIdCounter++;
        return saleIdCounter;
    }

    //IMPORTANE
    //Para la resolucion de la practica es necesario utilizar la funcion transferFrom tanto del ERC20 como del ERC721.
    //Porque quien va a realizar las llamadas de transferencia (transferFrom) va a ser el contrato del MarketPlace
    
    // function createSale(uint256 _tokenId, uint256 _price) public{
    //     //Ejemplo de uso de los contratos externos
    //     // MyNFTCollection.ownerOfToken(_tokenId)
    // }

    function createSale(uint256 _tokenId, uint256 _price) public {
    // Comprobar que el owner del token es quien llama a la función
    require(MyNFTCollectionContract.ownerOf(_tokenId) == msg.sender, "You are not the owner of the token");

    // Transferir el token ERC721 al contrato MyMarketPlace
    MyNFTCollectionContract.transferFrom(msg.sender, address(this), _tokenId);

    // Crear una nueva venta
    Sale memory newSale = Sale({
        owner: msg.sender,
        tokenId: _tokenId,
        price: _price,
        status: SaleStatus.Open
    });

    // Incrementar el contador de id de ventas
    uint256 saleId = incrementCounter();

    // Asignar la nueva venta al mapping de ventas
    sales[saleId] = newSale;
}

function buySale(uint256 _saleId) public {
    // Obtener la venta correspondiente al saleId
    Sale storage sale = sales[_saleId];

    // Comprobar que el comprador tiene balance suficiente de MyCoin para realizar la compra
    require(MyCoinContract.balanceOf(msg.sender) >= sale.price, "Insufficient balance");

    // Comprobar que el estado de la venta es Open
    require(sale.status == SaleStatus.Open, "Sale is not open"); 

    // Transferir los MyCoin desde la address del comprador a la address del vendedor
    MyCoinContract.transferFrom(msg.sender, sale.owner, sale.price);

    //Transfiere el token ERC721 desde la address de MyMarketPlace al address del comprador
    MyNFTCollectionContract.transferFrom(address(this), msg.sender, sale.tokenId);

    // Actualizar el estado de la venta a Executed
    sale.status = SaleStatus.Executed;
}

    function canceSale(uint256 _saleId) public {
        // Obtener la venta correspondiente al saleId
        Sale storage sale = sales[_saleId];

        // Comprobar que el owner del token es quien llama a la función
        require(sale.owner == msg.sender, "You are not the owner of the sale");

        // Comprobar que el estado de la venta es Open
        require(sale.status == SaleStatus.Open, "Sale is not open");

        // Transferir el token ERC721 desde el contrato MyMarketPlace al address del propietario
        MyNFTCollectionContract.transferFrom(address(this), sale.owner, sale.tokenId);

        // Actualizar el estado de la venta a Cancelled
        sale.status = SaleStatus.Cancelled;
    }

    function getSale(uint256 _saleId) public view returns(Sale memory) {
        // Comprobar que el saleId existe
        require(_saleId <= saleIdCounter, "Invalid saleId");

        // Devolver la información de la venta correspondiente al saleId
        return sales[_saleId];
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
}