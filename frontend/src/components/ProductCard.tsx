import React from 'react';
import type { Product } from '../api/types';

interface ProductCardProps {
    product: Product;
    quantity: number;
    isPurchasing: boolean;
    balance: number | null;
    onUpdateQuantity: (productId: string, newQty: number) => void;
    onBuyProduct: (productId: string) => void;
}

export default function ProductCard({
    product,
    quantity,
    isPurchasing,
    balance,
    onUpdateQuantity,
    onBuyProduct
}: ProductCardProps) {
    const totalCost = product.price * quantity;
    // [BONUS TODO 3]: Check if product is low stock and apply appropriate UI styles
    const isLowStock = product.stock <= 2;

    // Button state handling (keep original TODO comments in file)
    // [TODO 2]: button is expected to be disabled if 
    // 1. balance is not loaded (done for you as example)
    // 2. product is out of stock, button text:"❌ Out of Stock"
    // 3. already purchasing, button text: "⏳ Processing..."
    // when disabled, apply appropriate UI styles HINT: change text color and background color to grey and appropriate hover effect

    const isOutOfStock = product.stock === 0;
    const isDisabled = balance === null || isOutOfStock || isPurchasing;

    let buttonText = '🛒 Buy Now';
    if (isOutOfStock) buttonText = '❌ Out of Stock';
    else if (isPurchasing) buttonText = '⏳ Processing...';
    else if (balance === null) buttonText = '🔒 Start Machine';

    return (
        <div
            key={product.id}
            className={`product-card border-gray-300 rounded-3xl overflow-hidden shadow-lg`}
        >
            {/* Product Header with Icon */}
            <div className={`relative p-7 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600`}>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <span className="text-2xl">
                        {/* show a simple icon for product status */}
                        {isOutOfStock ? '❌' : isLowStock ? '⚠️' : '🍬'}
                    </span>
                </div>
                <h3 className="text-2xl font-black text-white text-shadow-lg pr-12 break-words">{product.name}</h3>
                {/* NOTES: This is just an example for you to comment out to test, you need to add your own UI styles! */}
                {/* [BONUS TODO 3]: {isLowStock && product.stock > 0 && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
              ⚡ Low Stock
            </span>
          </div>
        )} */}
                {/* keep the original commented block above intact */}
                {isLowStock && product.stock > 0 && (
                    <div className="mt-2">
                        <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                            ⚡ Low Stock
                        </span>
                    </div>
                )}
            </div>

            <div className="p-6 space-y-4 bg-white">
                {/* Price and Stock */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Price</div>
                        <div className="text-2xl font-black text-gray-900">${product.price.toFixed(2)}</div>
                    </div>
                    <div className={`p-4 rounded-xl border-2 ${product.stock > 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Stock</div>
                        <div className={`text-2xl font-black ${product.stock === 0 ? 'text-gray-500' : ''}`}>
                            {product.stock}
                        </div>
                    </div>
                </div>

                {/* Quantity Selector */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Quantity</label>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            disabled={quantity <= 1 || isPurchasing || isOutOfStock}
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100 disabled:from-gray-50 disabled:to-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-all font-black text-2xl shadow-md hover:shadow-lg active:scale-95 border-2 border-gray-300"
                            aria-label="decrease quantity"
                        >
                            −
                        </button>
                        <div className="flex-1 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-xl">
                            <span className="text-2xl font-black text-gray-900">{quantity}</span>
                        </div>
                        <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= product.stock || isPurchasing || isOutOfStock}
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100 disabled:from-gray-50 disabled:to-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-all font-black text-2xl shadow-md hover:shadow-lg active:scale-95 border-2 border-gray-300"
                            aria-label="increase quantity"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Total Cost */}
                <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-white/90 font-bold uppercase tracking-wide text-sm">Total</span>
                        <span className="text-3xl font-black text-white text-shadow-lg">${totalCost.toFixed(2)}</span>
                    </div>
                </div>

                {/* Buy Button */}
                {/* [TODO 2]: button is expected to be disabled if 
        1. balance is not loaded (done for you as example)
        2. product is out of stock, button text:"❌ Out of Stock"
        3. already purchasing, button text: "⏳ Processing..."
        when disabled, apply appropriate UI styles HINT: change text color and background color to grey and appropriate hover effect
        */}
                <button
                    onClick={() => onBuyProduct(product.id)}
                    disabled={isDisabled}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl 
            ${isDisabled
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed hover:shadow-none'
                            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white hover:shadow-2xl hover:scale-105 active:scale-95'}`}
                    aria-disabled={isDisabled}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}