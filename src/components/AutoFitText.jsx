import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';

const AutoFitText = ({
    text,
    minFontSize = 12,
    maxFontSize = 18,
    className = '',
    style = {}
}) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);

    // Use state to trigger re-renders if needed, but we'll manipulate DOM directly for speed in layout effect
    const [fontSize, setFontSize] = useState(maxFontSize);

    useLayoutEffect(() => {
        const container = containerRef.current;
        const textNode = textRef.current;
        if (!container || !textNode) return;

        const checkFit = () => {
            let currentSize = maxFontSize;
            textNode.style.fontSize = `${currentSize}px`;

            // Binary search or simple decrement could work. 
            // Since range is small (e.g. 18 to 12), decrement is fast enough and accurate.
            while (
                (textNode.scrollWidth > container.clientWidth) &&
                currentSize > minFontSize
            ) {
                currentSize -= 1;
                textNode.style.fontSize = `${currentSize}px`;
            }
        };

        checkFit();

        // Re-check on window resize
        window.addEventListener('resize', checkFit);
        return () => window.removeEventListener('resize', checkFit);
    }, [text, minFontSize, maxFontSize]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: '100%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                ...style
            }}
        >
            <span
                ref={textRef}
                style={{
                    display: 'inline-block',
                    fontSize: `${maxFontSize}px`, // Initial render size
                    fontWeight: 'bold' // Match h3 usually
                }}
            >
                {text}
            </span>
        </div>
    );
};

export default AutoFitText;
