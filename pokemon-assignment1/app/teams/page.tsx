"use client"

import React, { useEffect, useState } from "react"
import { Input, Button, Tag, message, Card } from "antd"
import { useRouter } from "next/navigation";


interface Pokemon {
  name: string
  image: string
  types: string[]
  base_experience: number
}

type Team = {
  name: string
  pokemons: Pokemon[]
}

export default function TeamsPage() {
  const [team, setTeam] = useState<Pokemon[]>([])
  const [searchName, setSearchName] = useState("")
  const [result, setResult] = useState<Pokemon | null>(null)
  const [teams, setTeams] = useState<{ name: string; pokemons: Pokemon[] }[]>([])
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0)
  const router = useRouter();


  const currentTeam = teams[selectedTeamIndex]?.pokemons || []

  const totalTypes = [...new Set(
    currentTeam.flatMap((pokemon) => pokemon.types)
  )]

  const avgExperience = currentTeam.length
    ? currentTeam.reduce((sum, p) => sum + p.base_experience, 0) / currentTeam.length
    : 0

  const saveAllTeamsToDB = async (teams: Team[]) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return console.warn("No token found")

    try {
      const response = await fetch("/api/teams/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teams }),
      })

      const data = await response.json()
      if (!response.ok) {
        console.error("Error saving teams:", data.error)
      } else {
        console.log("Teams saved successfully.")
      }
    } catch (error) {
      console.error("Failed to save teams:", error)
    }
  }

  const fetchPokemon = async () => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchName.toLowerCase()}`)
      const data = await res.json()
      const pokemon: Pokemon = {
        name: data.name,
        image: data.sprites.front_default,
        types: data.types.map((t: any) => t.type.name),
        base_experience: data.base_experience,
      }
      setResult(pokemon)
    } catch (error) {
      message.error("Pokémon not found")
      setResult(null)
    }
  }

  const fetchTeamsFromDB = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    try {
      const res = await fetch("/api/teams/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()

      if (res.ok) {
        setTeams(data.teams)
      } else {
        console.error("Failed to fetch teams:", data.error)
      }
    } catch (error) {
      console.error("Error loading teams:", error)
    }
  }

  useEffect(() => {
    fetchTeamsFromDB()
  }, []);

  useEffect(() => { 
    saveAllTeamsToDB(teams);
   }, [teams]);

  const addToTeam = () => {
    if (!result) return
    const currentTeam = teams[selectedTeamIndex]
    if (!currentTeam || currentTeam.pokemons.length >= 6) return message.warning("Team full")
    if (currentTeam.pokemons.some(p => p.name === result.name)) return message.warning("Already added")

    const updated = [...teams]
    updated[selectedTeamIndex].pokemons.push(result)
    setTeams(updated)
    setResult(null)
    setSearchName("")
  }

  const createNewTeam = () => {
    const name = prompt("Enter new team name:")
    if (!name) return
    setTeams([...teams, { name, pokemons: [] }])
    setSelectedTeamIndex(teams.length)
  }

  const renameTeam = () => {
    const name = prompt("Enter new name:")
    if (!name) return
    const updated = [...teams]
    updated[selectedTeamIndex].name = name
    setTeams(updated)
  }

  const deleteTeam = () => {
    if (teams.length === 1) return alert("At least one team required.")
    const updated = [...teams]
    updated.splice(selectedTeamIndex, 1)
    setTeams(updated)
    setSelectedTeamIndex(0)
  }


  return (
    <div>
      <div className="flex justify-end items-center p-4 border-b">
      <Button type="primary" onClick={() => router.push("/contracts")}>
        Contracts
      </Button>
    </div>
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left: Team Panel */}
      <div className="lg:w-1/3 w-full bg-gray-100 p-6 border-r border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Teams</h2>
          <Button size="small" onClick={createNewTeam}>+ New</Button>
        </div>

        <select
          className="w-full p-2 rounded mb-2"
          value={selectedTeamIndex}
          onChange={(e) => setSelectedTeamIndex(Number(e.target.value))}
        >
          {teams.map((team, index) => (
            <option key={index} value={index}>{team.name}</option>
          ))}
        </select>

        <div className="flex justify-between mb-4">
          <Button size="small" onClick={renameTeam}>Rename</Button>
          <Button size="small" danger onClick={deleteTeam}>Delete</Button>
        </div>

        {teams.length === 0 || teams[selectedTeamIndex].pokemons.length === 0 ? (
          <p className="text-gray-500">No Pokémon added.</p>
        ) : (
          <div className="space-y-4">
            {teams[selectedTeamIndex].pokemons.map(pokemon => (
              <div key={pokemon.name} className="flex justify-between items-center bg-white p-2 rounded shadow">
                <div className="flex items-center gap-3">
                  <img src={pokemon.image} alt={pokemon.name} className="w-10 h-10" />
                  <span className="capitalize">{pokemon.name}</span>
                </div>
                <Button type="link" danger onClick={() => {
                  const updated = [...teams]
                  updated[selectedTeamIndex].pokemons = updated[selectedTeamIndex].pokemons.filter(p => p.name !== pokemon.name)
                  setTeams(updated)
                }}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Right: Stats + Search Panel */}
      <div className="lg:w-2/3 w-full p-6 space-y-6">
        {/* Stats */}
        <div>
          <div className="mb-2">
            <p className="font-medium">Types Covered:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {totalTypes.map((type) => (
                <Tag key={type} color="blue">
                  {type}
                </Tag>
              ))}
            </div>
          </div>

          <p><strong>Average Base Experience:</strong> {avgExperience.toFixed(2)}</p>

        </div>

        {/* Search */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Search Pokémon</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              fetchPokemon()
            }}
            className="flex gap-4 mb-4"
          >
            <Input
              placeholder="Enter Pokémon name"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className="max-w-sm"
            />
            <Button type="primary" htmlType="submit">Search</Button>
          </form>


          {result && (
            <Card
              title={result.name.toUpperCase()}
              className="max-w-sm"
              cover={
                <div className="flex justify-center p-4">
                  <img src={result.image} alt={result.name} className="w-24 h-24" />
                </div>
              }
              extra={<Button onClick={addToTeam}>Add to Team</Button>}
            >
              <p><strong>Types:</strong></p>
              <div className="flex flex-wrap gap-2">
                {result.types.map(type => (
                  <Tag key={type} color="blue">{type}</Tag>
                ))}
              </div>
              <p className="mt-2">Base Exp: {result.base_experience}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
    </div>
    
  )
}
