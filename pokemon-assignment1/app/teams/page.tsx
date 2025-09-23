// "use client";

// import React, { useEffect, useState } from "react";
// import { Input, Button, Tag, Select, message, Card, Modal } from "antd";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import {
//   PlusCircleOutlined,
//   DeleteOutlined,
//   EditOutlined,
//   SaveOutlined,
//   CloseSquareOutlined,
//   DownCircleOutlined,
// } from "@ant-design/icons";

// interface Pokemon {
//   name: string;
//   image: string;
//   types: string[];
//   base_experience: number;
// }

// type Team = {
//   name: string;
//   pokemons: Pokemon[];
// };

// export default function TeamsPage() {
//   const [searchName, setSearchName] = useState("");
//   const [result, setResult] = useState<Pokemon | null>(null);
//   const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
//   const [allPokemonNames, setAllPokemonNames] = useState<string[]>([]);
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalType, setModalType] = useState<"new" | "rename" | null>(null);
//   const [teamNameInput, setTeamNameInput] = useState("");
//   const [messageApi, contextHolder] = message.useMessage();
//   const { Option } = Select;
//   const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
//   const router = useRouter();

//   const openNewTeamModal = () => {
//     setModalType("new");
//     setTeamNameInput("");
//     setIsModalOpen(true);
//   };

//   const openRenameTeamModal = () => {
//     setModalType("rename");
//     setTeamNameInput(teams[selectedTeamIndex]?.name || "");
//     setIsModalOpen(true);
//   };

//   const getTypeColor = (type: string) => {
//     const strong = ["fire", "fighting", "rock", "ground", "steel"];
//     const elemental = ["water", "grass", "electric", "ice", "bug", "poison"];
//     const mystic = [
//       "psychic",
//       "ghost",
//       "dragon",
//       "dark",
//       "fairy",
//       "flying",
//       "normal",
//     ];

//     if (strong.includes(type)) return "error";
//     if (elemental.includes(type)) return "success";
//     if (mystic.includes(type)) return "processing";
//     return "default";
//   };

//   const getTypeClass = (type: string) => {
//     const strong = ["fire", "fighting", "rock", "ground", "steel"];
//     const elemental = ["water", "grass", "electric", "ice", "bug", "poison"];
//     const mystic = [
//       "psychic",
//       "ghost",
//       "dragon",
//       "dark",
//       "fairy",
//       "flying",
//       "normal",
//     ];

//     if (strong.includes(type))
//       return "capitalize px-3 py-1 rounded-lg !bg-red-400/20 !border !border-gray-500";
//     if (elemental.includes(type))
//       return "capitalize px-3 py-1 rounded-lg !bg-green-400/20 !border !border-gray-500";
//     if (mystic.includes(type))
//       return "capitalize px-3 py-1 rounded-lg !bg-blue-400/20 !border !border-gray-500";

//     return "default";
//   };

//   // Fetch all Pokémon names once
//   useEffect(() => {
//     const fetchAllNames = async () => {
//       try {
//         const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
//         const data = await res.json();
//         setAllPokemonNames(data.results.map((p: any) => p.name));
//       } catch (err) {
//         console.error("Error fetching Pokémon list", err);
//       }
//     };
//     fetchAllNames();
//   }, []);

//   // DB fetch teams
//   const fetchTeamsFromDB = async () => {
//     const token = localStorage.getItem("auth_token");
//     if (!token) return;
//     try {
//       const res = await fetch("/api/teams/get", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (res.ok) setTeams(data.teams);
//     } catch (error) {
//       console.error("Error loading teams:", error);
//     }
//   };

//   useEffect(() => {
//     fetchTeamsFromDB();
//   }, []);

//   // DB save teams
//   const saveAllTeamsToDB = async (teams: Team[]) => {
//     const token = localStorage.getItem("auth_token");
//     if (!token) return console.warn("No token found");

//     try {
//       const response = await fetch("/api/teams/save", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ teams }),
//       });

//       const data = await response.json();
//       if (!response.ok) {
//         console.error("Error saving teams:", data.error);
//         messageApi.error("Failed to save teams");
//       } else {
//         messageApi.success("Teams saved successfully!");
//       }
//     } catch (error) {
//       console.error("Failed to save teams:", error);
//       messageApi.error("Error saving teams");
//     }
//   };

//   // Pokémon search
//   const fetchPokemon = async () => {
//     const query = searchName.toLowerCase();
//     if (!query) return;

//     const matchedNames = allPokemonNames.filter((name) =>
//       name.includes(query)
//     );

//     if (matchedNames.length === 0) {
//       message.error(`No Pokémon named "${searchName}"`);
//       setResult(null);
//       setSearchResults([]);
//       return;
//     }

//     if (matchedNames.includes(query)) {
//       try {
//         const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
//         const data = await res.json();
//         const pokemon: Pokemon = {
//           name: data.name,
//           image: data.sprites.front_default,
//           types: data.types.map((t: any) => t.type.name),
//           base_experience: data.base_experience,
//         };
//         setResult(pokemon);
//         setSearchResults([]);
//       } catch {
//         message.error(`No Pokémon named "${searchName}"`);
//         setResult(null);
//       }
//     } else {
//       try {
//         const promises = matchedNames.slice(0, 10).map(async (name) => {
//           const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
//           const data = await res.json();
//           return {
//             name: data.name,
//             image: data.sprites.front_default,
//             types: data.types.map((t: any) => t.type.name),
//             base_experience: data.base_experience,
//           } as Pokemon;
//         });

//         const results = await Promise.all(promises);
//         setSearchResults(results);
//         setResult(null);
//       } catch (err) {
//         console.error("Error fetching partial results", err);
//         message.error("Error fetching Pokémon");
//       }
//     }
//   };

//   // Team actions
//   const addToTeam = (pokemon: Pokemon) => {
//     if (!pokemon) return;
//     const currentTeam = teams[selectedTeamIndex];
//     if (!currentTeam || currentTeam.pokemons.length >= 6)
//       return message.warning("Team full");
//     if (currentTeam.pokemons.some((p) => p.name === pokemon.name))
//       return message.warning("Already added");

//     const updated = [...teams];
//     updated[selectedTeamIndex].pokemons.push(pokemon);
//     setTeams(updated);
//     setResult(null);
//     setSearchName("");
//   };

//   const deleteTeam = () => {
//     if (teams.length === 1) return alert("At least one team required.");
//     const updated = [...teams];
//     updated.splice(selectedTeamIndex, 1);
//     setTeams(updated);
//     setSelectedTeamIndex(0);
//   };

//   const currentTeam = teams[selectedTeamIndex]?.pokemons || [];
//   const totalTypes = [...new Set(currentTeam.flatMap((p) => p.types))];
//   const avgExperience = currentTeam.length
//     ? currentTeam.reduce((sum, p) => sum + p.base_experience, 0) /
//       currentTeam.length
//     : 0;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black text-white p-8">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-wide">
//           🎮 Pokémon Team Builder
//         </h1>
//         <Button
//           type="primary"
//           onClick={() => router.push("/contracts")}
//           className="text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
//         >
//           Contracts
//         </Button>
//       </div>

//       <div className="flex flex-col lg:flex-row items-start gap-8">
//         {/* Left: Team Panel */}
//         <div className="lg:w-2/3 w-full bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-white">Your Teams</h2>
//             <Button
//               icon={<PlusCircleOutlined />}
//               onClick={openNewTeamModal}
//               type="primary"
//               className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
//             >
//               New
//             </Button>
//           </div>

//           <div className="mb-7">
//             <Select
//               value={selectedTeamIndex}
//               onChange={(val) => setSelectedTeamIndex(val)}
//               suffixIcon={
//                 <DownCircleOutlined
//                   className="text-gray-400 text-lg"
//                   style={{ color: "gray", marginTop: "15px" }}
//                 />
//               }
//               className="w-full mb-8 custom-dark-select"
//               dropdownClassName="custom-dark-dropdown"
//             >
//               {teams.map((team, index) => (
//                 <Option key={index} value={index}>
//                   {team.name}
//                 </Option>
//               ))}
//             </Select>
//           </div>

//           <div className="flex justify-between mb-6">
//             <Button
//               icon={<EditOutlined />}
//               onClick={openRenameTeamModal}
//               type="primary"
//               ghost
//               className="bg-gray-700 text-white hover:bg-gray-600 hover:scale-105 hover:text-indigo-300 transition-all duration-200"
//             >
//               Rename
//             </Button>
//             <Button
//               icon={<DeleteOutlined />}
//               danger
//               ghost
//               onClick={deleteTeam}
//               className="bg-gray-700 text-white hover:bg-gray-600 hover:scale-105 hover:text-red-400 transition-all duration-200"
//             >
//               Delete
//             </Button>
//           </div>

//           {teams.length === 0 ||
//           teams[selectedTeamIndex].pokemons.length === 0 ? (
//             <p className="text-gray-400 italic">No Pokémon added yet.</p>
//           ) : (
//             <div className="space-y-4">
//               {teams[selectedTeamIndex].pokemons.map((pokemon) => (
//                 <div
//                   key={pokemon.name}
//                   className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-600 hover:duration-300 hover:border-gray-400"
//                 >
//                   <div className="flex items-center gap-4">
//                     <img
//                       src={pokemon.image}
//                       alt={pokemon.name}
//                       className="w-16 h-16 drop-shadow-lg"
//                     />
//                     <div className="flex flex-col">
//                       {/* Name */}
//                       <span className="capitalize font-semibold text-white-200">
//                         {pokemon.name}
//                       </span>

//                       {/* Types */}
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {pokemon.types.map((type) => (
//                           <span
//                             key={type}
//                             className="text-xs px-2 py-1 rounded-lg bg-gray-600 text-gray-200 capitalize"
//                           >
//                             {type}
//                           </span>
//                         ))}
//                       </div>

//                       {/* Base Experience */}
//                       <span className="text-xs text-gray-400 mt-1">
//                         Base Exp: {pokemon.base_experience}
//                       </span>
//                     </div>
//                   </div>

//                   <Button
//                     type="primary"
//                     icon={<CloseSquareOutlined />}
//                     danger
//                     ghost
//                     onClick={() => {
//                       const updated = [...teams];
//                       updated[selectedTeamIndex].pokemons = updated[
//                         selectedTeamIndex
//                       ].pokemons.filter((p) => p.name !== pokemon.name);
//                       setTeams(updated);
//                     }}
//                     className="bg-gray-700 text-white !hover:bg-gray-600 !hover:text-red-400 hover:scale-105 transition-all duration-200"
//                   >
//                     Remove
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Right Panel - Stats + Search */}
//         <div className="lg:w-1/3 w-full space-y-8">
//           {/* Stats */}
//           <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
//             <h2 className="text-2xl font-bold text-white mb-4">📊 Team Stats</h2>
//             <div className="mb-4">
//               <p className="font-medium text-gray-300">
//                 <strong>Types Covered:</strong>
//               </p>
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {totalTypes.map((type) => (
//                   <Tag key={type} color={getTypeColor(type)} className={getTypeClass(type)}>
//                     {type}
//                   </Tag>
//                 ))}
//               </div>
//             </div>
//             <p className="text-gray-300">
//               <strong>Average Base Experience:</strong>
//             </p>
//             <p>{avgExperience.toFixed(2)}</p>
//           </div>

//           {/* Search */}
//           <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
//             <h2 className="text-2xl font-bold text-white mb-6">🔍 Search Pokémon</h2>
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 fetchPokemon();
//               }}
//               className="flex gap-6 mb-6"
//             >
//               <Input
//                 placeholder="Enter Pokémon name"
//                 value={searchName}
//                 onChange={(e) => setSearchName(e.target.value)}
//                 className="!bg-gray-700 !text-gray-300 !border-gray-600 !placeholder-gray-300 max-w"
//               />
//               <Button
//                 type="primary"
//                 htmlType="submit"
//                 className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
//               >
//                 Search
//               </Button>
//             </form>

//             {/* Exact match */}
//             {result && (
//               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
//                 <Card
//                   className="max-w-sm !bg-gray-800 rounded-xl shadow-2xl !border !border-gray-600 !text-gray-200"
//                   cover={
//                     <div className="flex justify-center p-0 !bg-gray-800 rounded-t-sm max-w-80 m-2">
//                       <img src={result.image} alt={result.name} className="w-32 h-32 drop-shadow-xl" />
//                     </div>
//                   }
//                   title={<span className="text-xl font-bold text-cyan-300 tracking-wide">{result.name.toUpperCase()}</span>}
//                   extra={
//                     <Button
//                       onClick={() => addToTeam(result)}
//                       type="primary"
//                       className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium shadow-md rounded-md hover:scale-105 transition-all duration-300"
//                     >
//                       Add to Team
//                     </Button>
//                   }
//                   headStyle={{ background: "#1f2937", borderBottom: "2px solid #3f4855ff" }}
//                   bodyStyle={{ background: "#1f2937" }}
//                 >
//                   <p className="text-gray-300 mb-2">
//                     <strong className="text-cyan-200">Types:</strong>
//                   </p>
//                   <div className="flex flex-wrap gap-2 mb-3">
//                     {result.types.map((type) => (
//                       <Tag key={type} color={getTypeColor(type)} className={getTypeClass(type)}>
//                         {type}
//                       </Tag>
//                     ))}
//                   </div>
//                   <p className="text-gray-400">
//                     <strong className="text-cyan-200">Base Exp:</strong> {result.base_experience}
//                   </p>
//                 </Card>
//               </motion.div>
//             )}

//             {/* Partial matches */}
//             {searchResults.length > 0 && (
//               <div className="grid gap-4">
//                 {searchResults.map((p) => (
//                   <motion.div
//                     key={p.name}
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                   >
//                     <Card
//                       className="max-w-sm !bg-gray-800 rounded-xl shadow-2xl !border !border-gray-600 !text-gray-200"
//                       cover={
//                         <div className="flex justify-center p-0 !bg-gray-800 rounded-t-sm max-w-80 m-2">
//                           <img src={p.image} alt={p.name} className="w-32 h-32 drop-shadow-xl" />
//                         </div>
//                       }
//                       title={<span className="text-xl font-bold text-cyan-300 tracking-wide">{p.name.toUpperCase()}</span>}
//                       extra={
//                         <Button
//                           onClick={() => addToTeam(p)}
//                           type="primary"
//                           className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium shadow-md rounded-md hover:scale-105 transition-all duration-300"
//                         >
//                           Add to Team
//                         </Button>
//                       }
//                       headStyle={{ background: "#1f2937", borderBottom: "2px solid #3f4855ff" }}
//                       bodyStyle={{ background: "#1f2937" }}
//                     >
//                       <p className="text-gray-300 mb-2">
//                         <strong className="text-cyan-200">Types:</strong>
//                       </p>
//                       <div className="flex flex-wrap gap-2 mb-3">
//                         {p.types.map((type) => (
//                           <Tag key={type} color={getTypeColor(type)} className={getTypeClass(type)}>
//                             {type}
//                           </Tag>
//                         ))}
//                       </div>
//                       <p className="text-gray-400">
//                         <strong className="text-cyan-200">Base Exp:</strong> {p.base_experience}
//                       </p>
//                     </Card>
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Save button */}
//           <div className="flex justify-end">
//             <Button
//               icon={<SaveOutlined />}
//               type="primary"
//               className="bg-gradient-to-r from-yellow-500 to-red-600 text-white font-semibold shadow-lg rounded-lg hover:scale-105 transition-all duration-300"
//               onClick={() => saveAllTeamsToDB(teams)}
//             >
//               Save Teams
//             </Button>
//           </div>
//         </div>
//       </div>
//       {contextHolder}
//       {/* Modal */}
//       <Modal
//         centered
//         title={modalType === "new" ? "Create New Team" : "Rename Team"}
//         open={isModalOpen}
//         onOk={() => {
//           if (!teamNameInput.trim()) {
//             messageApi.error("Name cannot be empty");
//             return;
//           }
//           if (modalType === "new") {
//             setTeams([...teams, { name: teamNameInput, pokemons: [] }]);
//             setSelectedTeamIndex(teams.length);
//           } else if (modalType === "rename") {
//             const updated = [...teams];
//             updated[selectedTeamIndex].name = teamNameInput;
//             setTeams(updated);
//           }
//           setIsModalOpen(false);
//         }}
//         onCancel={() => setIsModalOpen(false)}
//         okText="Save"
//         cancelText="Cancel"
//         className="dark-modal"
//       >
//         <Input
//           placeholder="Enter team name"
//           value={teamNameInput}
//           onChange={(e) => setTeamNameInput(e.target.value)}
//           className="!placeholder-gray-300 max-w"
//         />
//       </Modal>
//     </div>
//   );
// }

// TeamsPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  Tag,
  Select,
  message,
  Card,
  Modal,
  Pagination,
  Spin,
} from "antd";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PlusCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseSquareOutlined,
  DownCircleOutlined,
} from "@ant-design/icons";

interface Pokemon {
  name: string;
  image: string;
  types: string[];
  base_experience: number;
}

type Team = {
  name: string;
  pokemons: Pokemon[];
};

export default function TeamsPage() {
  const [searchName, setSearchName] = useState("");
  const [result, setResult] = useState<Pokemon | null>(null); // exact match
  const [pageResults, setPageResults] = useState<Pokemon[]>([]); // results for current page
  const [allPokemonNames, setAllPokemonNames] = useState<string[]>([]);
  const [matchedNames, setMatchedNames] = useState<string[]>([]); // all matched names for pagination
  const [teams, setTeams] = useState<Team[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"new" | "rename" | null>(null);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const { Option } = Select;
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const router = useRouter();

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [loading, setLoading] = useState(false); // for searches and page loads

  const openNewTeamModal = () => {
    setModalType("new");
    setTeamNameInput("");
    setIsModalOpen(true);
  };

  const openRenameTeamModal = () => {
    setModalType("rename");
    setTeamNameInput(teams[selectedTeamIndex]?.name || "");
    setIsModalOpen(true);
  };

  const getTypeColor = (type: string) => {
    const strong = ["fire", "fighting", "rock", "ground", "steel"];
    const elemental = ["water", "grass", "electric", "ice", "bug", "poison"];
    const mystic = [
      "psychic",
      "ghost",
      "dragon",
      "dark",
      "fairy",
      "flying",
      "normal",
    ];

    if (strong.includes(type)) return "error";
    if (elemental.includes(type)) return "success";
    if (mystic.includes(type)) return "processing";
    return "default";
  };

  const getTypeClass = (type: string) => {
    const strong = ["fire", "fighting", "rock", "ground", "steel"];
    const elemental = ["water", "grass", "electric", "ice", "bug", "poison"];
    const mystic = [
      "psychic",
      "ghost",
      "dragon",
      "dark",
      "fairy",
      "flying",
      "normal",
    ];

    if (strong.includes(type))
      return "capitalize px-3 py-1 rounded-lg !bg-red-400/20 !border !border-gray-500";
    if (elemental.includes(type))
      return "capitalize px-3 py-1 rounded-lg !bg-green-400/20 !border !border-gray-500";
    if (mystic.includes(type))
      return "capitalize px-3 py-1 rounded-lg !bg-blue-400/20 !border !border-gray-500";

    return "default";
  };

  // Fetch all Pokémon names once (limit 1000)
  useEffect(() => {
    const fetchAllNames = async () => {
      try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
        const data = await res.json();
        setAllPokemonNames(data.results.map((p: any) => p.name));
      } catch (err) {
        console.error("Error fetching Pokémon list", err);
        messageApi.error("Failed to load Pokémon list");
      }
    };
    fetchAllNames();
  }, []);

  // DB fetch teams
  const fetchTeamsFromDB = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      const res = await fetch("/api/teams/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTeams(data.teams);
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  useEffect(() => {
    fetchTeamsFromDB();
  }, []);

  // DB save teams
  const saveAllTeamsToDB = async (teams: Team[]) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return console.warn("No token found");

    try {
      const response = await fetch("/api/teams/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teams }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error saving teams:", data.error);
        messageApi.error("Failed to save teams");
      } else {
        messageApi.success("Teams saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save teams:", error);
      messageApi.error("Error saving teams");
    }
  };

  // Fetch details for a list of names (used for pagination)
  const fetchDetailsForNames = async (names: string[]) => {
    try {
      const promises = names.map(async (name) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();
        return {
          name: data.name,
          image: data.sprites.front_default,
          types: data.types.map((t: any) => t.type.name),
          base_experience: data.base_experience,
        } as Pokemon;
      });

      const results = await Promise.all(promises);
      return results;
    } catch (err) {
      console.error("Error fetching Pokémon details", err);
      throw err;
    }
  };

  // fetch a page (lazy loads only page items)
  const fetchPage = async (page: number, size = pageSize) => {
    setLoading(true);
    setResult(null); // clear exact-match UI when showing paginated partials
    try {
      const start = (page - 1) * size;
      const sliceNames = matchedNames.slice(start, start + size);
      if (sliceNames.length === 0) {
        setPageResults([]);
        setCurrentPage(page);
        setLoading(false);
        return;
      }
      const details = await fetchDetailsForNames(sliceNames);
      setPageResults(details);
      setCurrentPage(page);
    } catch (err) {
      messageApi.error("Error fetching page results");
      setPageResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Pokémon search (exact + pagination-enabled partials)
  const fetchPokemon = async () => {
    const query = searchName.toLowerCase().trim();
    if (!query) return;
    setLoading(true);
    setTimeout(async () => {
      setResult(null);
      setPageResults([]);
      setMatchedNames([]);

      try {
        const matched = allPokemonNames.filter((name) => name.includes(query));

        if (matched.length === 0) {
          messageApi.error(`No Pokémon named "${searchName}"`);
          setLoading(false);
          return;
        }

        // exact match -> show single
        if (matched.includes(query)) {
          try {
            const res = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${query}`
            );
            const data = await res.json();
            const pokemon: Pokemon = {
              name: data.name,
              image: data.sprites.front_default,
              types: data.types.map((t: any) => t.type.name),
              base_experience: data.base_experience,
            };
            setResult(pokemon);
          } catch (err) {
            messageApi.error(`No Pokémon named "${searchName}"`);
            setResult(null);
          } finally {
            setMatchedNames([]); // clear pagination
            setLoading(false);
          }
        } else {
          // partial match: set matchedNames and load first page
          setMatchedNames(matched);
          await fetchPage(1, pageSize);
          setLoading(false);
        }
      } catch (err) {
        console.error("Search error", err);
        messageApi.error("Error searching Pokémon");
        setLoading(false);
      }
    }, 500);
  };

  // Team actions
  const addToTeam = (pokemon: Pokemon) => {
    if (!pokemon) return;
    const currentTeam = teams[selectedTeamIndex];
    if (!currentTeam || currentTeam.pokemons.length >= 6)
      return messageApi.warning("Team full");
    if (currentTeam.pokemons.some((p) => p.name === pokemon.name))
      return messageApi.warning("Already added");

    const updated = [...teams];
    updated[selectedTeamIndex].pokemons.push(pokemon);
    setTeams(updated);
    setResult(null);
    setSearchName("");
    messageApi.success(`${pokemon.name} added to team`);
  };

  const deleteTeam = () => {
    if (teams.length === 1) return alert("At least one team required.");
    const updated = [...teams];
    updated.splice(selectedTeamIndex, 1);
    setTeams(updated);
    setSelectedTeamIndex(0);
  };

  const currentTeam = teams[selectedTeamIndex]?.pokemons || [];
  const totalTypes = [...new Set(currentTeam.flatMap((p) => p.types))];
  const avgExperience = currentTeam.length
    ? currentTeam.reduce((sum, p) => sum + p.base_experience, 0) /
      currentTeam.length
    : 0;

  // handle pagination change
  const onPageChange = async (page: number, size?: number) => {
    if (size && size !== pageSize) {
      setPageSize(size);
      // fetch first page with new size
      await fetchPage(1, size);
    } else {
      await fetchPage(page, pageSize);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token"); // clear token
    messageApi.success("Logged out successfully");
    router.push("/auth/login"); // redirect to login page (change path if different)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black text-white p-8">
      {contextHolder}
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-cyan-300 drop-shadow-lg tracking-wide">
          Pokémon Team Builder
        </h1>
        <div className="flex gap-4">
          <Button
            type="primary"
            onClick={() => router.push("/contracts")}
            className="text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
          >
            Contracts
          </Button>
          <Button
            danger
            ghost
            onClick={handleLogout}
            className="bg-gray-700 text-white hover:bg-gray-600 hover:scale-105 hover:text-red-400 transition-all duration-200"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left: Team Panel */}
        <div className="lg:w-2/3 w-full bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Teams</h2>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={openNewTeamModal}
              type="primary"
              className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
            >
              New
            </Button>
          </div>

          <div className="mb-7">
            <Select
              value={selectedTeamIndex}
              onChange={(val) => setSelectedTeamIndex(val)}
              suffixIcon={
                <DownCircleOutlined
                  className="text-gray-400 text-lg"
                  style={{ color: "gray", marginTop: "15px" }}
                />
              }
              className="w-full mb-8 custom-dark-select"
              dropdownClassName="custom-dark-dropdown"
            >
              {teams.map((team, index) => (
                <Option key={index} value={index}>
                  {team.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="flex justify-between mb-6">
            <Button
              icon={<EditOutlined />}
              onClick={openRenameTeamModal}
              type="primary"
              ghost
              className="bg-gray-700 text-white hover:bg-gray-600 hover:scale-105 hover:text-indigo-300 transition-all duration-200"
            >
              Rename
            </Button>
            <Button
              icon={<DeleteOutlined />}
              danger
              ghost
              onClick={deleteTeam}
              className="bg-gray-700 text-white hover:bg-gray-600 hover:scale-105 hover:text-red-400 transition-all duration-200"
            >
              Delete
            </Button>
          </div>

          {teams.length === 0 ||
          teams[selectedTeamIndex]?.pokemons.length === 0 ? (
            <p className="text-gray-400 italic">No Pokémon added yet.</p>
          ) : (
            <div className="space-y-4">
              {teams[selectedTeamIndex].pokemons.map((pokemon) => (
                <div
                  key={pokemon.name}
                  className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-600 hover:duration-300 hover:border-gray-400"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={pokemon.image}
                      alt={pokemon.name}
                      className="w-16 h-16 drop-shadow-lg"
                    />
                    <div className="flex flex-col">
                      <span className="capitalize font-semibold text-white-200">
                        {pokemon.name}
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {pokemon.types.map((type) => (
                          <span
                            key={type}
                            className="text-xs px-2 py-1 rounded-lg bg-gray-600 text-gray-200 capitalize"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        Base Exp: {pokemon.base_experience}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    icon={<CloseSquareOutlined />}
                    danger
                    ghost
                    onClick={() => {
                      const updated = [...teams];
                      updated[selectedTeamIndex].pokemons = updated[
                        selectedTeamIndex
                      ].pokemons.filter((p) => p.name !== pokemon.name);
                      setTeams(updated);
                    }}
                    className="bg-gray-700 text-white !hover:bg-gray-600 !hover:text-red-400 hover:scale-105 transition-all duration-200"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Stats + Search */}
        <div className="lg:w-1/3 w-full space-y-8">
          {/* Stats */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">
              📊 Team Stats
            </h2>
            <div className="mb-4">
              <p className="font-medium text-gray-300">
                <strong>Types Covered:</strong>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {totalTypes.map((type) => (
                  <Tag
                    key={type}
                    color={getTypeColor(type)}
                    className={getTypeClass(type)}
                  >
                    {type}
                  </Tag>
                ))}
              </div>
            </div>
            <p className="text-gray-300">
              <strong>Average Base Experience:</strong>
            </p>
            <p>{avgExperience.toFixed(2)}</p>
          </div>

          {/* Search */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              🔍 Search Pokémon
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchPokemon();
              }}
              className="flex gap-6 mb-6"
            >
              <Input
                placeholder="Enter Pokémon name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onPressEnter={() => fetchPokemon()}
                className="!bg-gray-700 !text-gray-300 !border-gray-600 !placeholder-gray-300 max-w"
              />
              <Button
                type="primary"
                htmlType="submit"
                className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
                loading={loading}
              >
                Search
              </Button>
            </form>

            {/* Exact match */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : (
              result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card
                    key={result.name}
                    title={result.name.toUpperCase()}
                    className="bg-gray-900 text-white rounded-xl"
                    headStyle={{ backgroundColor: "#111827", color: "#fff" }} // Title bar
                    bodyStyle={{ backgroundColor: "#1f2937", color: "#fff" }} // Body
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      {/* Left: Pokémon image */}
                      <img
                        alt={result.name}
                        src={result.image}
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "contain",
                        }}
                      />

                      {/* Right: Info */}
                      <div>
                        <p>
                          <strong>Base Experience:</strong>{" "}
                          {result.base_experience}
                        </p>
                        <p>
                          <strong>Types:</strong>{" "}
                          {result.types.map((type) => (
                            <Tag key={type} color="blue">
                              {type}
                            </Tag>
                          ))}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            )}
            {/* Partial matches (paginated) */}
            {matchedNames.length > 0 && (
              <>
                <div className="mb-3 text-gray-300">
                  Showing{" "}
                  {Math.min(
                    matchedNames.length,
                    (currentPage - 1) * pageSize + 1
                  )}{" "}
                  -{Math.min(matchedNames.length, currentPage * pageSize)} of{" "}
                  {matchedNames.length} results
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spin />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pageResults.map((p) => (
                      <motion.div
                        key={p.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Card key={p.name} title={p.name.toUpperCase()}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                            }}
                          >
                            {/* Left: Pokémon image */}
                            <img
                              alt={p.name}
                              src={p.image}
                              style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "contain",
                              }}
                            />

                            {/* Right: Info */}
                            <div>
                              <p>
                                <strong>Base Experience:</strong>{" "}
                                {p.base_experience}
                              </p>
                              <p>
                                <strong>Types:</strong>{" "}
                                {p.types.map((type) => (
                                  <Tag key={type} color="blue">
                                    {type}
                                  </Tag>
                                ))}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <div className="flex justify-center mt-4">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={matchedNames.length}
                    showSizeChanger
                    pageSizeOptions={["3", "6", "12", "24"]}
                    onChange={onPageChange}
                    showTotal={(total) => `Total ${total} results`}
                  />
                </div>
              </>
            )}

            {/* Save button */}
            <div className="flex justify-end mt-6">
              <Button
                icon={<SaveOutlined />}
                type="primary"
                className="bg-gradient-to-r from-yellow-500 to-red-600 text-white font-semibold shadow-lg rounded-lg hover:scale-105 transition-all duration-300"
                onClick={() => saveAllTeamsToDB(teams)}
              >
                Save Teams
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        centered
        title={modalType === "new" ? "Create New Team" : "Rename Team"}
        open={isModalOpen}
        onOk={() => {
          if (!teamNameInput.trim()) {
            messageApi.error("Name cannot be empty");
            return;
          }
          if (modalType === "new") {
            setTeams([...teams, { name: teamNameInput, pokemons: [] }]);
            setSelectedTeamIndex(teams.length);
          } else if (modalType === "rename") {
            const updated = [...teams];
            updated[selectedTeamIndex].name = teamNameInput;
            setTeams(updated);
          }
          setIsModalOpen(false);
        }}
        onCancel={() => setIsModalOpen(false)}
        okText="Save"
        cancelText="Cancel"
        className="dark-modal"
      >
        <Input
          placeholder="Enter team name"
          value={teamNameInput}
          onChange={(e) => setTeamNameInput(e.target.value)}
          className="!placeholder-gray-300 max-w"
        />
      </Modal>
    </div>
  );
}
