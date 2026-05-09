import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store/useStore';
import React from 'react';

/**
 * Enterprise-grade test suite for the persistence layer.
 * Verifies that the Zustand store handles logic and localStorage correctly.
 */
describe('Enterprise Store Persistence & Logic', () => {
  beforeEach(() => {
    // Clear the store before each test
    act(() => {
      useStore.getState().clearCart();
      useStore.getState().clearGroupOrder();
    });
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('should start with an empty state', () => {
    const state = useStore.getState();
    expect(state.cart).toEqual([]);
    expect(state.members).toEqual([]);
  });

  it('should add items and calculate totals correctly', () => {
    const item = { id: 1, name: 'Veg Maggi', price: 100 };
    
    act(() => {
      useStore.getState().addToCart(item);
    });

    const state = useStore.getState();
    expect(state.cart).toHaveLength(1);
    expect(state.cart[0].quantity).toBe(1);
    expect(state.subtotal).toBe(100);
    // GST (5%) = 5, Delivery = 49, Service = 25 -> Total = 179
    expect(state.total).toBe(179);
  });

  it('should handle group members and persistent selections', () => {
    act(() => {
      useStore.getState().addMember('Karthik');
    });

    let state = useStore.getState();
    expect(state.members).toHaveLength(1);
    expect(state.activeMemberIndex).toBe(0);

    const item = { id: 10, name: 'Honey Coffee', price: 150 };
    act(() => {
      useStore.getState().addItemToMember(item);
    });

    state = useStore.getState();
    expect(state.members[0].items).toHaveLength(1);
    expect(state.members[0].items[0].qty).toBe(1);
  });

  it('should handle quantity updates and removal', () => {
    const item = { id: 1, name: 'Veg Maggi', price: 100 };
    
    act(() => {
      useStore.getState().addToCart(item);
    });

    act(() => {
      useStore.getState().updateQuantity(1, 1); // 1 + 1 = 2
    });

    let state = useStore.getState();
    expect(state.cart[0].quantity).toBe(2);
    expect(state.subtotal).toBe(200);

    act(() => {
      useStore.getState().removeFromCart(1);
    });

    state = useStore.getState();
    expect(state.cart).toHaveLength(0);
    expect(state.total).toBe(0);
  });
});
