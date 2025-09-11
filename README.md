## SETUP

1. Clone the Repository

```bash
  git clone https://github.com/<your-org>/eth-supply-chain.git
  cd eth-supply-chain
```

2. Setup the Blockchain (Hardhat)
```bash
  cd web3
  npm install

```
3. Setup the Frontend and Backend

   3.1. Next.js (Frontend + Backend)

   ⚡ Make sure you are inside the root /eth-supply-chain/ folder.


```bash
  npx create-next-app@latest .
```
 ⚠️ Don’t miss the . at the end → this tells Next.js to set up inside the current folder instead of creating a subfolder.


 You’ll be asked the same questions. Recommended answers:
 ```vbnet
✔ Would you like to use TypeScript? … No
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like your code inside a `src/` directory? … Yes
✔ Would you like to use App Router (recommended)? … Yes
✔ Would you like to use Turbopack for `next dev`? … No
✔ Would you like to customize the import alias (`@/*` by default)? … No
```
Once setup finishes, run the dev server:
```bash
  npm run dev
```
Your Next.js app will be live at: 👉 http://localhost:3000


📂 Your folder structure will now look like this:
```bash
  / (root = Next.js frontend project)
├── public/                     # Static assets
├── src/                        # Frontend code only
│   ├── app/                    # Next.js 15 routes & pages
│   ├── components/             # UI components
│   ├── styles/                 # Tailwind + global CSS
│   ├── store/                  # Zustand state management
│   └── web3-config/            # ABI + contract addresses (for frontend)
│       ├── SupplyChain.json
│       └── addresses.json
│
├── web3/                       # Hardhat blockchain project
│   ├── contracts/              # Solidity contracts
│   │   └── SupplyChain.sol
│   ├── scripts/                # Deployment scripts
│   │   └── deploy.js
│   ├── test/                   # Mocha/Chai tests
│   │   └── SupplyChain.test.js
│   ├── hardhat.config.js       # Hardhat config
│   ├── package.json            # Blockchain dependencies
│   └── README.md               # Docs for blockchain part
│
├── .gitignore
├── README.md                   # (this file)
├── package.json                # Next.js frontend dependencies
└── tailwind.config.js
```

## Contributing

Contributions are always welcome!

dont contribute directly to master branch ....

🔹 1. Clone the Repository


```bash
  git clone https://github.com/<your-org>/eth-supply-chain.git
  cd eth-supply-chain
```


Now you’re inside the project folder, on master branch.

🔹 2. Check Available Branches
```bash
git branch
```

* shows your current branch.

Only master will be there right after cloning.

🔹 3. Create a New Branch
```bash
git checkout -b <branch-name>
```

Example:
```bash
git checkout -b bhotto
```

👉 Creates and switches to bhotto.

🔹 4. Switch Between Branches
```bash
git checkout <branch-name>
```

Example:
```bash
git checkout master   # switch back to master
git checkout bhotto   # switch to bhotto again
```
🔹 5. Delete a Branch (if needed)

Delete local branch (must not be on it):
```bash
git branch -d <branch-name>
```


🔹 6. Make Changes & Commit
```bash
git add .
git commit -m "your commit message"
```
🔹 7. Push Your Branch to GitHub
```bash
git push origin <branch-name>
```
🔹 8. Open Pull Request

On GitHub → PR page

Base branch = master

Compare branch = <branch-name>

Add title + description → Submit PR.

🔹 9. Keep Contributing

If PR not merged yet, just keep committing & pushing:
```bash
git add .
git commit -m "more updates"
git push origin <branch-name>
```

👉 Same PR will update automatically.

