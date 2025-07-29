export const BASE_SFT_SUBGRAPH_URL =
  "https://api.goldsky.com/api/public/project_cm153vmqi5gke01vy66p4ftzf/subgraphs/sft-offchainassetvaulttest-base/1.0.3/gn";
export const BASE_ORDERBOOK_SUBGRAPH_URL =
  "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-base/2024-12-13-9c39/gn";
export const BASE_METADATA_SUBGRAPH_URL =
  "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/metadata-base/2025-07-06-594f/gn";
export const TARGET_NETWORK = "base";
export const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";
export const ORDERBOOK_CONTRACT_ADDRESS = "0xd2938E7c9fe3597F78832CE780Feb61945c377d7";

export type Claim = {
  orderHash: string;
  csvLink: string;
};

export type SftToken = {
  address: string;
  claims: Claim[];
};

export type EnergyField = {
  name: string;
  sftTokens: SftToken[];
};
export const ENERGY_FEILDS: EnergyField[] = [
  {
    name: "Bakken Horizon Field",
    sftTokens: [
      {
        address: "0xd5316ca888491575befc0273a00de2186c53f760",
        claims: [
          {
            orderHash: "0xac3f693a57a43f04c76d62b5e8335084fe0d5c9b4b205c35f61ed748ebe7c7ec",
            csvLink: "https://gateway.pinata.cloud/ipfs/bafkreiceeasgwffk27kvrgfh4dihiekb7iiznqyjpbabavjrucymv2pobe",
          },
          {
            orderHash: "0x055ccf387c414d256a79e8fbd00ba9d2d15305cebc4616e57a57b88c9751dda4",
            csvLink: "https://gateway.pinata.cloud/ipfs/bafkreidtqov24bkl6ylcjqbt2pjhx5ya7glezwnnnln7hwu7cyq6jhxnzi",
          }
        ],
      },
      {
        address: "0xea9a6f77483a07bc287dfb8dad151042376eb153",
        claims: [
          {
            orderHash: "0xd64151706bf941d444324d0c8adebff154419ed471d69ddb299b05eb69a568de",
            csvLink: "https://gateway.pinata.cloud/ipfs/bafkreiea3bziwveo2nhbcui4jdxx4m42b3fs3ekyu45n7hdabhadqpf3ki",
          }
        ],
      },
    ],
  },
  {
    name: "Gulf of Mexico-4",
    sftTokens: [
      {
        address: "0xae69a129b626b1e8fce196ef8e7d5faea3be753f",
        claims: [
          {
            orderHash: "0xa4d540c50f8409d2cafb6ae0cbff0bd8fb18c666981cf02269524215f16da4ac",
            csvLink: "https://gateway.pinata.cloud/ipfs/bafkreihov36lw43igwx6fcy7iguconfi4vzjnbdppoqt4zb72ydygtvfey",
          },
        ],
      },
    ],
  },
  {
    name: "Permian Basin-3 Release 1",
    sftTokens: [
      {
        address: "0xc699575fe18f00104d926f0167cd858ce6d8b32e",
        claims: [
          {
            orderHash: "0x48f7af9ea6c9caeb742fa6a772fce7c4b2eace510dc9bdcf019c029306434ad2",
            csvLink: "https://gateway.pinata.cloud/ipfs/bafkreicjcemmypds6d5c4lonwp56xb2ilzhkk7hty3y6fo4nvdkxnaibgu",
          }
        ],
      },
    ],
  },
];
