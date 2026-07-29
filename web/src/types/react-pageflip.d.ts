/**
 * Minimal type declarations for react-pageflip@2.0.3
 * (package does not ship its own .d.ts)
 */
declare module 'react-pageflip' {
  import React from 'react';

  export interface PageFlipInstance {
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    flip(page: number, corner?: 'top' | 'bottom'): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
  }

  export interface HTMLFlipBookProps {
    /** Width of a single page in px */
    width: number;
    /** Height of a single page in px */
    height: number;

    // Optional sizing/behaviour props
    size?: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPagedButton?: boolean;
    className?: string;
    style?: React.CSSProperties;
    startPage?: number;

    // Callbacks
    onFlip?: (e: { data: number }) => void;
    onChangeOrientation?: (e: { data: string }) => void;
    onChangeState?: (e: { data: string }) => void;
    onInit?: (e: { data: { page: number; mode: string } }) => void;
    onUpdate?: (e: { data: { page: number; mode: string } }) => void;

    children?: React.ReactNode;
    ref?: React.Ref<HTMLFlipBookRef>;
  }

  export interface HTMLFlipBookRef {
    pageFlip(): PageFlipInstance;
  }

  export const HTMLFlipBook: React.ForwardRefExoticComponent<
    HTMLFlipBookProps & React.RefAttributes<HTMLFlipBookRef>
  >;

  export default HTMLFlipBook;
}
