import userImage from "../assets/images/user.png";

type ImageProps = {
  src?: string;
  alt?: string;
  className?: string;
};

export const Image = ({ src, alt, className }: ImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${className}`}
      onError={(e) => {
        const target = e.currentTarget as HTMLImageElement;
        target.onerror = null;
        target.src = userImage;
      }}
    />
  );
};
