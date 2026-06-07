import type { VercelConfig } from '@vercel/config/v1';

//my-clinic-trinity-fe
export const config: VercelConfig = {
  git: {
    deploymentEnabled: {
      'my-clinic-*': false,
      '*-fe': true,
    },
  },
};

/*import type { VercelConfig } from '@vercel/config/v1';
 A branch named experiment-my-branch-dev will create a deployment.
export const config: VercelConfig = {
  git: {
    deploymentEnabled: {
      'experiment-*': false,
      '*-dev': true,
    },
  },
};*/
