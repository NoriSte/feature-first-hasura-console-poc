import styles from './hasura-features.module.css';

/* eslint-disable-next-line */
export interface HasuraFeaturesProps {}

export function HasuraFeatures(props: HasuraFeaturesProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to HasuraFeatures!</h1>
    </div>
  );
}

export default HasuraFeatures;
