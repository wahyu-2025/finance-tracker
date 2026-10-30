interface apiConfigProps {
  wallets: string;
}

const API_URL_WALLETS = import.meta.env.VITE_API_URL;

const apiConfig: apiConfigProps = {
  wallets: `${API_URL_WALLETS}`,
};

export { apiConfig };
