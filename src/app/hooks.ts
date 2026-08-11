import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';

/**
 * Pre-typed versions of the plain `useDispatch`/`useSelector` hooks.
 * Use these throughout the app instead of the plain react-redux hooks
 * so state and dispatch are typed without repeating generics everywhere.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
