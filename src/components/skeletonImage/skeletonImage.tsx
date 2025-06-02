import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import styles from './skeletonImage.module.css'

interface SkeletonImageProps extends Omit<ImageProps, 'onLoad'> {
  skeletonClassName?: string;
}

const SkeletonImage = React.forwardRef<HTMLImageElement | null, SkeletonImageProps>(
  ({ skeletonClassName, ...props }, ref) => {
    const [load, setLoad] = useState<boolean>(true);

    function handleLoad(event: React.SyntheticEvent<HTMLImageElement>) {
      event.currentTarget.style.opacity = 'revert-layer';
      setTimeout(() => {
        setLoad(false);
      }, 1500);
    }

    return (
      <>
        <Image
          style={{ opacity: '0' }}
          {...props}
          ref={ref}
          onLoad={handleLoad}
        />
        {load && (
          <span
            tabIndex={0}
            aria-label="carregando imagem"
            className={skeletonClassName || styles.skeleton}
          ></span>
        )}
      </>
    );
  }
);

SkeletonImage.displayName = 'SkeletonImage'

export default SkeletonImage;