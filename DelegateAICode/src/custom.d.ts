declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

declare module 'figma:asset/*' {
  /** When you do `import img from 'figma:asset/...png'`, you’ll get back a string URL */
  const url: string;
  export default url;
}