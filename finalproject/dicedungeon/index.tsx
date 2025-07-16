import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// --- Type Definitions ---
interface ItemData {
    name: string;
    desc: string;
    image: string;
    attack?: number;
}
interface WeaponData {
    [id: number]: ItemData & { attack: number };
}
interface TrophyData {
    [id: number]: ItemData;
}
interface TileData {
    type: 'start' | 'corner' | 'item' | 'monster' | 'empty';
    icon?: string;
    image?: string;
    name?: string;
    weaponId?: number;
    power?: number;
    isBoss?: boolean;
}
interface ContractItem {
    itemName: string;
    description: string;
    image: string;
}
interface CombatMonsterData extends TileData {
    currentHealth: number;
}
interface Web3State {
    provider: any;
    signer: any;
    userAddress: string;
    contract: any;
}
interface ModalData {
    type: 'simple' | 'mint' | 'trophy';
    title: string;
    text?: string;
    isGameOver?: boolean;
    imageUrl?: string;
    weaponId?: number;
    trophy?: ItemData;
}
interface CombatRolls {
    player: number;
    monster: number;
}


// --- Game Constants ---
const targetChainId = '0x7a69'; // 31337 in hex (Hardhat Network)
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
const contractABI = [
  "constructor()",
  "function getMyWeapons() view returns (tuple(string itemName, string description, string image, bool isUsed, address owner)[])",
  "function getWeapon(uint256) view returns (tuple(string itemName, string description, string image, bool isUsed, address owner))",
  "function markAsUsed(uint256)",
  "function mintWeapon(address, string, string, string)",
  "function name() view returns (string)",
  "function nextTokenId() view returns (uint256)",
  "function owner() view returns (address)",
  "function ownerWeapons(address, uint256) view returns (uint256)",
  "function symbol() view returns (string)",
  "function useWeapon(uint256)",
  "function weapons(uint256) view returns (string, string, string, bool, address)",
];
const weaponsData: WeaponData = {
    1: { name: "Fire Sword", desc: "A blazing blade engulfed in searing flames.", image: "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeidx4kct47zpldzvcsmanjzl2ybao4qfeewiw7257mcy4y2xgxou3m/nft_1.png", attack: 10 },
    2: { name: "Ice Sword", desc: "A frigid blade of enchanted ice that freezes all in its path.", image: "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeidx4kct47zpldzvcsmanjzl2ybao4qfeewiw7257mcy4y2xgxou3m/nft_2.png", attack: 15 },
    3: { name: "Flame Thunder", desc: "A sword wreathed in roaring flames and crackling with thunder.", image: "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeidx4kct47zpldzvcsmanjzl2ybao4qfeewiw7257mcy4y2xgxou3m/nft_3.png", attack: 20 },
    4: { name: "Magic Dagger", desc: "A silent blade forged in shadow that strikes before you’re seen.", image: "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeidx4kct47zpldzvcsmanjzl2ybao4qfeewiw7257mcy4y2xgxou3m/nft_4.png", attack: 12 },
    5: { name: "Soul Sword", desc: "A radiant sword that channels the light of departed souls.", image: "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeidx4kct47zpldzvcsmanjzl2ybao4qfeewiw7257mcy4y2xgxou3m/nft_5.png", attack: 18 },
    6: { name: "Meteior Sword", desc: "A celestial blade forged from a blazing meteorite.", image: "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeidx4kct47zpldzvcsmanjzl2ybao4qfeewiw7257mcy4y2xgxou3m/nft_6.png", attack: 12 },
    7: { name: "Dark Sword", desc: "A cursed sword steeped in shadow that feeds on fear.", image: "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeidx4kct47zpldzvcsmanjzl2ybao4qfeewiw7257mcy4y2xgxou3m/nft_7.png", attack: 18 },
    8: { name: "Time Traveler Sword", desc: "A time-bending blade that cuts through past, present, and future.", image: "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeidx4kct47zpldzvcsmanjzl2ybao4qfeewiw7257mcy4y2xgxou3m/nft_8.png", attack: 12 },
    9: { name: "Enlighten Sword", desc: "A luminous blade imbued with the wisdom of the ancients.", image: "https://cyan-defeated-booby-344.mypinata.cloud/ipfs/bafybeidx4kct47zpldzvcsmanjzl2ybao4qfeewiw7257mcy4y2xgxou3m/nft_9.png", attack: 18 }
};
const trophyData: TrophyData = {
    1: { name: "Goblin Ear", desc: "A grotesque reminder of your first battles.", image: "https://placehold.co/128x128/166534/FFFFFF?text=Ear" },
    2: { name: "Wolf Pelt", desc: "A rugged pelt from a fearsome wolf.", image: "https://placehold.co/128x128/78716c/FFFFFF?text=Pelt" },
    3: { name: "Bat Wing", desc: "A leathery wing from a creature of the night.", image: "https://placehold.co/128x128/4b5563/FFFFFF?text=Wing" },
    4: { name: "Scorpion Stinger", desc: "The venomous tip of a desert hunter.", image: "https://placehold.co/128x128/ef4444/FFFFFF?text=Stinger" },
    5: { name: "Golem Core", desc: "The magical stone that animated a stone giant.", image: "https://placehold.co/128x128/f97316/FFFFFF?text=Core" },
};
const boardSize = 6;
const totalTiles = (boardSize * 4) - 4;
const MAX_PLAYER_HEALTH = 100;

const App: React.FC = () => {
    // --- State ---
    const [boardLayout, setBoardLayout] = useState<TileData[]>([]);
    const [playerPosition, setPlayerPosition] = useState(0);
    const [playerHealth, setPlayerHealth] = useState(MAX_PLAYER_HEALTH);
    const [playerAttack, setPlayerAttack] = useState(0);
    const [ownedItems, setOwnedItems] = useState<ContractItem[]>([]);
    const [ownedWeaponIds, setOwnedWeaponIds] = useState<number[]>([]);
    const [messages, setMessages] = useState<string[]>([]);
    const [modal, setModal] = useState<ModalData | null>(null);
    const [web3, setWeb3] = useState<Web3State | null>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [diceDisplay, setDiceDisplay] = useState('🎲');
    const [isRolling, setIsRolling] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    // Game Progression
    const [currentLevel, setCurrentLevel] = useState(1);
    const [usedTrophies, setUsedTrophies] = useState<string[]>([]); // by itemName
    // Combat State
    const [isInCombat, setIsInCombat] = useState(false);
    const [combatMonster, setCombatMonster] = useState<CombatMonsterData | null>(null);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [combatRolls, setCombatRolls] = useState<CombatRolls | null>(null);


    // --- Refs ---
    const playerRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const messageLogRef = useRef<HTMLDivElement>(null);

    // --- Utility Functions ---
    const logMessage = useCallback((msg: string) => {
        setMessages(prev => [`> ${msg}`, ...prev.slice(0, 9)]);
    }, []);

    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const generateRandomBoardLayout = useCallback((level: number): TileData[] => {
        const newLayout: TileData[] = Array(totalTiles).fill(null);
        newLayout[0] = { type: 'start', icon: '🏁' };
        const cornerImage = 'images/redcastle.png';
        newLayout[boardSize - 1] = { type: 'corner', name: 'Castle', image: cornerImage };
        newLayout[(boardSize - 1) * 2] = { type: 'corner', name: 'Castle', image: cornerImage };
        newLayout[(boardSize - 1) * 3] = { type: 'corner', name: 'Castle', image: cornerImage };

        const availableIndices = [];
        for (let i = 1; i < totalTiles; i++) {
            if (newLayout[i] === null) availableIndices.push(i);
        }
        shuffleArray(availableIndices);

        // Place limited, random weapons
        const allWeaponIds = Object.keys(weaponsData).map(Number);
        shuffleArray(allWeaponIds);
        const weaponCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 weapons
        const weaponsForThisLevel = allWeaponIds.slice(0, weaponCount);
        const itemImage = 'images/weapon.png';
        const itemsToPlace: TileData[] = weaponsForThisLevel.map(id => ({ type: 'item', name: 'Weapon', image: itemImage, weaponId: id }));

        // Scale monster power based on level
        const powerBonus = (level - 1) * 5;
        let baseMonsters: TileData[] = [
             { type: 'monster', name: 'Goblin', image: 'images/goblin.png', power: 10 },
             { type: 'monster', name: 'Ghost', image: 'images/ghost.png', power: 15 },
             { type: 'monster', name: 'Dragon', image: 'images/dragon.png', power: 25, isBoss: true },
             { type: 'monster', name: 'Ark', image: 'images/ark.png', power: 12 },
             { type: 'monster', name: 'Wolf', image: 'images/wolve.png', power: 18 },
             { type: 'monster', name: 'Caster', image: 'images/caster.png', power: 22 },
             { type: 'monster', name: 'Snake', image: 'images/snake.png', power: 14 },
             { type: 'monster', name: 'Scorpion', image: 'images/sporpion.png', power: 19 },
             { type: 'monster', name: 'Bat', image: 'images/bat.png', power: 8 },
             { type: 'monster', name: 'Golem', image: 'images/golem.png', power: 30 }
        ];

        let monstersToPlace = shuffleArray(baseMonsters).map(m => ({ ...m, power: (m.power || 0) + powerBonus }));
        
        itemsToPlace.forEach(item => { if (availableIndices.length > 0) newLayout[availableIndices.pop()!] = item; });
        monstersToPlace.forEach(monster => { if (availableIndices.length > 0) newLayout[availableIndices.pop()!] = monster; });
        availableIndices.forEach(index => { newLayout[index] = { type: 'empty' }; });

        return newLayout;
    }, []);
    
    const startNewLevel = useCallback((level: number) => {
        setBoardLayout(generateRandomBoardLayout(level));
        setPlayerPosition(0);
        setIsMoving(false);
        logMessage(`Level ${level} begins! The monsters feel stronger...`);
    }, [generateRandomBoardLayout, logMessage]);

    const initializeGame = useCallback(() => {
        setPlayerHealth(MAX_PLAYER_HEALTH);
        setOwnedItems([]);
        setOwnedWeaponIds([]);
        setPlayerAttack(0);
        setMessages(['> Welcome! Connect your wallet to start playing.']);
        setCurrentLevel(1);
        setUsedTrophies([]);
        setBoardLayout(generateRandomBoardLayout(1));
    }, [generateRandomBoardLayout]);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    // --- Web3 Functions ---
    const connectWallet = useCallback(async () => {
        if (typeof (window as any).ethereum === 'undefined') {
            logMessage("Please install MetaMask!");
            setModal({ type: 'simple', title: "Error", text: "MetaMask not found. Please install the browser extension." });
            return;
        }

        try {
            const provider = new (window as any).ethers.BrowserProvider((window as any).ethereum);
            const network = await provider.getNetwork();

            if (network.chainId.toString() !== parseInt(targetChainId, 16).toString()) {
                logMessage(`Please switch to network with ChainID: ${parseInt(targetChainId, 16)}`);
                setModal({ type: 'simple', title: "Incorrect Network", text: `Please switch your network in MetaMask to Hardhat (ChainID: ${parseInt(targetChainId, 16)})`});
                return;
            }

            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            const contract = new (window as any).ethers.Contract(contractAddress, contractABI, signer);

            setWeb3({ provider, signer, userAddress, contract });
            logMessage(`Connected to Wallet: ${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`);
        } catch (error) {
            console.error("Could not connect to wallet:", error);
            logMessage("Wallet connection failed.");
            setModal({ type: 'simple', title: "An error occurred.", text: "Could not connect to wallet. Please try again."});
        }
    }, [logMessage]);

    const updateOwnedItems = useCallback(async () => {
        if (!web3?.contract) return;
        try {
            const itemsResult: ContractItem[] = await web3.contract.getMyWeapons();
            setOwnedItems(itemsResult);
    
            let newAttack = 0;
            const newIds: number[] = [];
    
            itemsResult.forEach((item) => {
                const weaponEntry = Object.entries(weaponsData).find(([id, data]) => data.name === item.itemName);
                if (weaponEntry) {
                    const [id, data] = weaponEntry;
                    newIds.push(parseInt(id));
                    newAttack += data.attack;
                }
            });
    
            setOwnedWeaponIds(newIds);
            setPlayerAttack(newAttack);
    
        } catch (error) {
            console.error("Failed to fetch items:", error);
            logMessage("Failed to fetch items.");
        }
    }, [web3, logMessage]);

    useEffect(() => {
        if(web3?.contract) {
            updateOwnedItems();
        }
    }, [web3, updateOwnedItems]);


    const mintNFT = useCallback(async (item: ItemData) => {
        if (!web3?.contract || !item) return;

        setModal({ type: 'simple', title: "Minting...", text: `Creating NFT for "${item.name}"... Please confirm in MetaMask.` });
        
        try {
            const tx = await web3.contract.mintWeapon(web3.userAddress, item.name, item.desc, item.image);
            logMessage(`Submitting Transaction: ${tx.hash.substring(0,10)}...`);
            
            await tx.wait();
            
            logMessage(`Mint successful! You received "${item.name}".`);
            setModal({ type: 'simple', title: "Success!", text: `You've received "${item.name}" in your wallet.`, imageUrl: item.image });
            
            updateOwnedItems();
        } catch (error) {
            console.error("Minting failed:", error);
            logMessage("Minting failed.");
            setModal({ type: 'simple', title: "Failed", text: "Item minting failed. Please check the console." });
        }
    }, [web3, logMessage, updateOwnedItems]);

    const useTrophy = (item: ContractItem) => {
        if (playerHealth >= MAX_PLAYER_HEALTH) {
            logMessage("Your health is already full.");
            return;
        }
        setPlayerHealth(current => Math.min(MAX_PLAYER_HEALTH, current + 100));
        setUsedTrophies(prev => [...prev, item.itemName]);
        logMessage(`You used ${item.itemName} and recovered 100 HP!`);
        setIsInventoryOpen(false);
    };

    // --- Game Logic ---
    const handleTileAction = useCallback((position: number) => {
        const tileData = boardLayout[position];
        if (!tileData) return;

        const logText = tileData.name ? `${tileData.type}: ${tileData.name}` : tileData.type;
        logMessage(`You landed on: ${logText}`);

        const grantRandomHealth = () => {
            const healthBonus = Math.floor(Math.random() * (45 - 10 + 1)) + 10;
            setPlayerHealth(currentHealth => {
                const newHealth = Math.min(MAX_PLAYER_HEALTH, currentHealth + healthBonus);
                const healthGained = newHealth - currentHealth;
                if (healthGained > 0) {
                     logMessage(`You gained ${healthGained} HP! Your health is now ${newHealth}.`);
                } else {
                     logMessage(`Your health is already full.`);
                }
                return newHealth;
            });
        };

        switch (tileData.type) {
            case 'item':
                if (!ownedWeaponIds.includes(tileData.weaponId!)) {
                    logMessage(`You found an item: "${weaponsData[tileData.weaponId!].name}"!`);
                    setModal({type: 'mint', title: 'Item Found!', weaponId: tileData.weaponId});
                } else {
                    logMessage(`You already own this item. Its faint aura restores some health.`);
                    grantRandomHealth();
                }
                break;
            case 'monster':
                logMessage(`You encountered a ${tileData.name} (Power: ${tileData.power})!`);
                setCombatRolls(null); // Reset rolls for new combat
                setCombatLog([`--- Combat started with ${tileData.name} ---`]);
                setCombatMonster({ ...tileData, currentHealth: (tileData.power ?? 10) * 5 });
                setIsInCombat(true);
                break;
            case 'corner':
                logMessage("You rest at a castle, regaining your strength.");
                grantRandomHealth();
                break;
        }
    }, [boardLayout, ownedWeaponIds, logMessage]);

    const movePlayer = useCallback(async (steps: number) => {
        let finalPosition = playerPosition;
        for (let i = 0; i < steps; i++) {
            finalPosition = (finalPosition + 1) % totalTiles;
            setPlayerPosition(finalPosition);
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        setTimeout(() => handleTileAction(finalPosition), 100);
    }, [playerPosition, handleTileAction]);

    const rollDice = useCallback(async () => {
        if (isMoving || playerHealth <= 0 || !web3 || isInCombat) return;
        
        setIsMoving(true);
        setIsRolling(true);

        const roll = Math.floor(Math.random() * 6) + 1;
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setDiceDisplay(['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][roll - 1]);
        setIsRolling(false);
        logMessage(`You rolled a ${roll}!`);

        await movePlayer(roll);

        setIsMoving(false);
    }, [isMoving, playerHealth, web3, logMessage, movePlayer, isInCombat]);

     // --- Combat Logic ---
     const handleCombatTurn = () => {
        if (!combatMonster) return;

        let monsterHP = combatMonster.currentHealth;
        let pHealth = playerHealth;
        let logs: string[] = [];

        // Determine rolls
        const playerDice = Math.floor(Math.random() * 20) + 1;
        const monsterDice = Math.floor(Math.random() * 20) + 1;
        setCombatRolls({ player: playerDice, monster: monsterDice });

        // Player's turn
        const playerDamage = playerDice + playerAttack;
        monsterHP -= playerDamage;
        logs.push(`You rolled ${playerDice} (+${playerAttack} ATK) and dealt ${playerDamage} damage!`);

        if (monsterHP <= 0) {
            setCombatLog(prev => [...logs, ...prev]);
            endCombat(true);
            return;
        }

        // Monster's turn
        const monsterPowerBonus = Math.floor((combatMonster.power ?? 10) / 2);
        const monsterDamage = monsterDice + monsterPowerBonus;
        pHealth -= monsterDamage;
        logs.push(`${combatMonster.name} rolled ${monsterDice} (+${monsterPowerBonus} Power) and dealt you ${monsterDamage} damage!`);
        
        setCombatMonster(m => m ? { ...m, currentHealth: monsterHP } : null);
        setPlayerHealth(pHealth);
        setCombatLog(prev => [...logs, ...prev]);

        if (pHealth <= 0) {
            endCombat(false);
        }
    };
    
    const endCombat = (isWin: boolean) => {
        setIsInCombat(false);
        const defeatedMonster = combatMonster;
        setCombatMonster(null);
    
        if (isWin) {
            logMessage(`You defeated ${defeatedMonster?.name}!`);
            if (defeatedMonster?.isBoss) {
                const newLevel = currentLevel + 1;
                setCurrentLevel(newLevel);
                setModal({ type: 'simple', title: "BOSS DEFEATED!", text: `You have defeated ${defeatedMonster.name}! The journey to Level ${newLevel} begins.`, imageUrl: defeatedMonster.image });
                setTimeout(() => {
                    startNewLevel(newLevel);
                }, 3000);
            } else {
                // Regular monster drop
                const dropRoll = Math.random();
                if (dropRoll > 0.5) { // 50% chance to drop a trophy
                    const trophyKeys = Object.keys(trophyData);
                    const randomTrophyKey = trophyKeys[Math.floor(Math.random() * trophyKeys.length)];
                    const droppedTrophy = trophyData[parseInt(randomTrophyKey)];
                    setModal({
                        type: 'trophy',
                        title: 'Item Drop!',
                        text: `${defeatedMonster?.name} dropped a ${droppedTrophy.name}!`,
                        trophy: droppedTrophy
                    });
                } else {
                    setModal({ type: 'simple', title: "Victory!", text: `You have successfully defeated ${defeatedMonster?.name}!`, imageUrl: defeatedMonster?.image });
                }
            }
        } else {
            logMessage("You were defeated in battle...");
        }
    };

    // --- Player Position & UI Updates ---
    const updatePlayerPosition = useCallback(() => {
        if (!playerRef.current || !boardRef.current || !boardRef.current.clientWidth) return;

        const boardEl = boardRef.current;
        const playerEl = playerRef.current;

        const tileWidth = boardEl.clientWidth / boardSize;
        const tileHeight = boardEl.clientHeight / boardSize;
        const playerSize = tileWidth * 0.8;
        
        let row, col;
        if (playerPosition <= boardSize - 1) { row = 0; col = playerPosition; }
        else if (playerPosition <= (boardSize - 1) * 2) { col = boardSize - 1; row = playerPosition - (boardSize - 1); }
        else if (playerPosition <= (boardSize - 1) * 3) { row = boardSize - 1; col = (boardSize - 1) * 3 - playerPosition; }
        else { row = (boardSize - 1) * 4 - playerPosition; col = 0; }

        playerEl.style.width = `${playerSize}px`;
        playerEl.style.height = `${playerSize}px`;
        playerEl.style.top = `${row * tileHeight + (tileHeight / 2) - (playerSize / 2)}px`;
        playerEl.style.left = `${col * tileWidth + (tileWidth / 2) - (playerSize / 2)}px`;
    }, [playerPosition]);
    
    useEffect(() => {
        updatePlayerPosition();
        window.addEventListener('resize', updatePlayerPosition);
        return () => window.removeEventListener('resize', updatePlayerPosition);
    }, [updatePlayerPosition]);

    useEffect(() => {
        if(messageLogRef.current) {
            messageLogRef.current.scrollTop = 0; // Scroll to top to see latest message
        }
    }, [messages]);
    
    useEffect(() => {
        if (playerHealth <= 0 && !isInCombat) {
            setModal({ type: 'simple', title: "Game Over", text: "You have been defeated... Your health has run out.", isGameOver: true });
        }
    }, [playerHealth, isInCombat]);

    const getPathIndex = (row: number, col: number) => {
        if (row === 0) return col;
        if (col === boardSize - 1) return (boardSize - 1) + row;
        if (row === boardSize - 1) return (boardSize - 1) * 2 + (boardSize - 1 - col);
        if (col === 0) return (boardSize - 1) * 3 + (boardSize - 1 - row);
        return -1;
    };
    
    const ControlPanel = () => (
        <div className="w-full h-full bg-gray-900 p-4 sm:p-6 flex flex-col gap-4 border border-gray-700">
            {/* Logo for Desktop */}
            <div className="hidden lg:flex items-center gap-4 pb-4 border-b border-gray-700">
                <img src="images/logo.png" alt="Dice Dungeon Logo" className="h-12 w-auto"/>
                <h1 className="text-2xl font-bold text-yellow-300">DICE DUNGEON</h1>
            </div>

            {/* Wallet Info */}
            {web3 && (
                <div>
                    <div className="p-2 rounded-lg bg-gray-800 text-center">
                        <p className="text-sm font-semibold text-white">Connected:</p>
                        <p className="text-xs text-gray-400 break-all">{web3.userAddress}</p>
                    </div>
                </div>
            )}
    
            {/* Stats */}
            <div className="space-y-3 border-t pt-4 border-gray-700">
                <div className="flex justify-between items-center"><span className="font-semibold text-white">Level:</span><span className="font-bold text-xl text-purple-400">{currentLevel}</span></div>
                <div className="flex justify-between items-center"><span className="font-semibold text-white">Health:</span><span className="font-bold text-xl text-red-500">{Math.max(0, playerHealth)}</span></div>
                <div className="flex justify-between items-center"><span className="font-semibold text-white">Attack:</span><span className="font-bold text-xl text-yellow-400">{playerAttack}</span></div>
                <div>
                    <button onClick={() => setIsInventoryOpen(true)} className="inventory-button w-full">
                        View Inventory ({ownedItems.length})
                    </button>
                </div>
            </div>
    
            {/* Message Log */}
            <div className="flex-grow flex flex-col min-h-0">
                <h2 className="font-semibold text-white mb-2">Recent Events:</h2>
                <div ref={messageLogRef} className="flex-grow rounded-md p-2 overflow-hidden border border-gray-700 bg-gray-800 space-y-2">
                    {messages.map((msg, i) => <div key={i} className="message-card">{msg}</div>)}
                </div>
            </div>
        </div>
    );

    const InventoryModal = () => {
        const isTrophy = (item: ContractItem) => Object.values(trophyData).some(t => t.name === item.itemName);
        const visibleItems = ownedItems.filter(item => !usedTrophies.includes(item.itemName));

        return (
            <div className="modal-overlay">
                <div className="inventory-modal-content">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-yellow-300">Inventory</h2>
                        <button onClick={() => setIsInventoryOpen(false)} className="text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {visibleItems.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No items in inventory yet.</p>
                    ) : (
                        <div className="inventory-grid">
                            {visibleItems.map((item, index) => (
                                <div key={index} className="inventory-item">
                                    <img src={item.image} alt={item.itemName} className="w-24 h-24 object-cover rounded-md border-2 border-gray-600" onError={(e) => (e.currentTarget.src = 'https://placehold.co/96x96/333/fff?text=NFT')} />
                                    <h3 className="font-semibold mt-2 text-white">{item.itemName}</h3>
                                    <p className="text-xs text-gray-400">{item.description}</p>
                                    {isTrophy(item) && (
                                        <button onClick={() => useTrophy(item)} className="trophy-use-button">
                                            Use (+100 HP)
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // --- Render ---
    return (
        <div className="w-screen h-screen flex flex-col bg-black text-white p-2 sm:p-4 font-sans">
            <main className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-8 relative flex-grow h-0">
                
                {/* Mobile Panel Toggle */}
                {web3 && (
                    <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="mobile-toggle lg:hidden" aria-label="Toggle info panel">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                )}


                {/* Main Content */}
                <div className="w-full flex-grow flex flex-col items-center h-full">
                    {/* Mobile Logo */}
                    <div className="w-full flex justify-center py-2 lg:hidden">
                        <img src="images/logo.png" alt="Dice Dungeon Logo" className="h-10 w-auto"/>
                    </div>
                    {/* Board Section */}
                    <div className="flex-grow w-full flex flex-col items-center justify-center">
                        <div id="board-container" className="board-container flex-shrink-0 flex items-center justify-center">
                            <div id="board" ref={boardRef} className="board rounded-lg overflow-hidden shadow-2xl">
                                {boardLayout.length > 0 && Array.from({ length: boardSize * boardSize }).map((_, index) => {
                                    const row = Math.floor(index / boardSize);
                                    const col = index % boardSize;
                                    if (row === 0 || row === boardSize - 1 || col === 0 || col === boardSize - 1) {
                                        const pathIndex = getPathIndex(row, col);
                                        const tileData = boardLayout[pathIndex];
                                        if(!tileData) return <div key={index} className="inner-tile"></div>;
                                        const isOwned = tileData.weaponId && ownedWeaponIds.includes(tileData.weaponId);
                                        return (
                                            <div key={index} className={`tile ${tileData.type} ${isOwned ? 'owned-item-tile': ''}`}>
                                                {tileData.image && <img src={tileData.image} alt={tileData.name || tileData.type} className={`tile-image ${tileData.isBoss ? 'boss-monster' : ''}`} />}
                                                {tileData.icon && <span className="tile-icon">{tileData.icon}</span>}
                                            </div>
                                        );
                                    } else {
                                        return <div key={index} className="inner-tile"></div>;
                                    }
                                })}
                            </div>
                            <div id="player" ref={playerRef} className="player">
                                <img src="images/hero.png" alt="Player Icon" />
                            </div>
                        </div>
                    </div>
                     {/* Dice Section */}
                    <div className="flex flex-col items-center gap-2 py-2">
                        <div className={`dice text-6xl ${isRolling ? 'rolling' : ''}`}>{diceDisplay}</div>
                        <button onClick={rollDice} disabled={isMoving || playerHealth <= 0 || !web3 || isInCombat} className="w-64 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">Roll Dice</button>
                    </div>
                </div>

                {/* Control Panel (Desktop) */}
                <div className="hidden lg:flex lg:w-auto lg:max-w-sm flex-shrink-0 mt-0 h-full">
                    <ControlPanel />
                </div>
                
                 {/* Control Panel (Mobile) */}
                <div className={`mobile-panel lg:hidden ${isPanelOpen ? 'open' : ''}`}>
                    <button onClick={() => setIsPanelOpen(false)} className="absolute top-2 right-2 text-white z-10" aria-label="Close panel">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <ControlPanel />
                </div>
            </main>

            {/* Initial Connect Modal */}
             {!web3 && (
                 <div className="modal-overlay">
                     <div className="modal-content">
                        <img src="images/logo.png" alt="Game Logo" className="mx-auto w-48 h-auto mb-6" />
                        <h1 className="text-2xl font-bold mb-2 text-white">Dice Dungeon</h1>
                        <p className="text-gray-400 mb-8">Connect your wallet to start the adventure.</p>
                        <button onClick={connectWallet} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">Connect Wallet</button>
                     </div>
                 </div>
             )}

            {/* Game Event Modal */}
            {modal && (
                 <div className="modal-overlay">
                    <div className="modal-content">
                        {modal.type === 'simple' && (
                            <>
                                <h2 className="text-2xl font-bold mb-4 text-yellow-400">{modal.title}</h2>
                                {modal.imageUrl && <img src={modal.imageUrl} alt={modal.title} className="w-32 h-32 mx-auto mb-4 rounded-lg object-contain shadow-lg" onError={(e)=>(e.currentTarget.src = 'https://placehold.co/128x128/333/fff?text=IMG')} />}
                                <p className="mb-6 text-gray-300">{modal.text}</p>
                                <button
                                    onClick={() => modal.isGameOver ? window.location.reload() : setModal(null)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                                    {modal.isGameOver ? 'Restart' : 'OK'}
                                </button>
                            </>
                        )}
                        {modal.type === 'mint' && weaponsData[modal.weaponId!] && (
                             <>
                                <h2 className="text-2xl font-bold mb-2 text-yellow-400">{modal.title}</h2>
                                <img src={weaponsData[modal.weaponId!].image} alt={weaponsData[modal.weaponId!].name} className="w-48 h-48 mx-auto my-4 rounded-lg object-cover shadow-lg border-2 border-gray-500" onError={(e)=>(e.currentTarget.src='https://placehold.co/192x192/333/fff?text=NFT')} />
                                <h3 className="text-xl font-semibold text-white">{weaponsData[modal.weaponId!].name}</h3>
                                <p className="text-gray-400 my-2">{weaponsData[modal.weaponId!].desc}</p>
                                <p className="text-yellow-400 font-bold">Attack Power: +{weaponsData[modal.weaponId!].attack}</p>
                                <div className="flex gap-4 justify-center mt-6">
                                    <button onClick={() => {mintNFT(weaponsData[modal.weaponId!]); setModal(null);}} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Mint NFT</button>
                                    <button onClick={() => setModal(null)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">Decline</button>
                                </div>
                            </>
                        )}
                        {modal.type === 'trophy' && modal.trophy && (
                            <>
                                <h2 className="text-2xl font-bold mb-2 text-purple-400">{modal.title}</h2>
                                <img src={modal.trophy.image} alt={modal.trophy.name} className="w-48 h-48 mx-auto my-4 rounded-lg object-cover shadow-lg border-2 border-purple-500" onError={(e)=>(e.currentTarget.src='https://placehold.co/192x192/333/fff?text=NFT')} />
                                <h3 className="text-xl font-semibold text-white">{modal.trophy.name}</h3>
                                <p className="text-gray-400 my-2">{modal.trophy.desc}</p>
                                <div className="flex gap-4 justify-center mt-6">
                                    <button onClick={() => {mintNFT(modal.trophy!); setModal(null);}} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">Mint Trophy</button>
                                    <button onClick={() => setModal(null)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">Decline</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {/* Combat Modal */}
            {isInCombat && combatMonster && (
                <div className="modal-overlay">
                    <div className="combat-modal-content">
                        <h2 className="text-3xl font-bold text-red-500 mb-4">Combat Initiated!</h2>
                        
                        <div className="flex justify-around items-start text-center mb-4">
                            {/* Player */}
                            <div className="relative">
                                <h3 className="text-xl font-bold text-blue-400">You</h3>
                                <img src="images/hero.png" className="w-24 h-24 mx-auto my-2"/>
                                <div className="text-lg">HP: <span className="font-bold text-green-400">{Math.max(0, playerHealth)}</span></div>
                                <div className="text-lg">ATK: <span className="font-bold text-yellow-400">{playerAttack}</span></div>
                                {combatRolls?.player && <div className="combat-roll-display">{combatRolls.player}</div>}
                            </div>
                            
                             <div className="text-4xl font-bold self-center text-gray-500">VS</div>

                            {/* Monster */}
                            <div className="relative">
                                <h3 className="text-xl font-bold text-red-400">{combatMonster.name}</h3>
                                <img src={combatMonster.image} className="w-24 h-24 mx-auto my-2"/>
                                <div className="text-lg">HP: <span className="font-bold text-green-400">{Math.max(0, combatMonster.currentHealth)}</span></div>
                                <div className="text-lg">Power: <span className="font-bold text-yellow-400">{combatMonster.power}</span></div>
                                {combatRolls?.monster && <div className="combat-roll-display">{combatRolls.monster}</div>}
                            </div>
                        </div>

                        {/* Combat Log */}
                        <div className="w-full h-32 bg-gray-900 border border-gray-600 rounded-md p-2 overflow-y-auto mb-4 text-sm">
                            {combatLog.map((log, i) => <p key={i} className="text-gray-300">{log}</p>)}
                        </div>

                        {/* Action Button */}
                        <button onClick={handleCombatTurn} disabled={playerHealth <= 0 || combatMonster.currentHealth <= 0} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-xl rounded-lg shadow-lg disabled:bg-gray-600">
                           Roll to Attack!
                        </button>
                    </div>
                </div>
            )}
            
            {/* Inventory Modal */}
            {isInventoryOpen && <InventoryModal />}
        </div>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);