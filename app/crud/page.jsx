'use client'
import React, { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/app/firebase/config'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'

export default function CrudOperations() {
  const [user] = useAuthState(auth)
  const router = useRouter()

  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ name: '', quantity: '' })
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [recipe, setRecipe] = useState('')

  // Redirect to sign-in if the user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/sign-in')
    }
  }, [user, router])

  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + parseFloat(item.quantity), 0)
    setTotal(newTotal.toFixed(2))
  }, [items])

  const addItem = async (e) => {
    e.preventDefault()
    if (newItem.name && newItem.quantity) {
      setItems([
        ...items,
        { id: items.length + 1, name: newItem.name, quantity: parseFloat(newItem.quantity), image: null },
      ])
      setNewItem({ name: '', quantity: '' })
    }
  }

  const deleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleImageUpload = (id, e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = function (event) {
        const img = new Image()
        img.src = event.target.result
        img.onload = function () {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = 20
          canvas.height = 20
          ctx.drawImage(img, 0, 0, 20, 20)
          const resizedImageURL = canvas.toDataURL()
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.id === id ? { ...item, image: resizedImageURL } : item
            )
          )
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const generateRecipe = async () => {
    const itemNames = items.map((item) => item.name).join(', ')

    try {
      const response = await fetch('/api/generateRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: itemNames }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecipe(data.recipe)
      } else {
        console.error('Failed to fetch recipe')
      }
    } catch (error) {
      console.error('Error fetching recipe:', error)
    }
  }

  return (
    <main className='flex min-h-screen flex-col items-center'>
      <div className='w-full max-w-5xl flex justify-between items-center p-4'>
        <p className='text-xl font-bold text-rose-200'>Welcome, {user?.email}!</p>
        <button
          onClick={() => {
            signOut(auth)
            sessionStorage.removeItem('user')
            router.push('/sign-in')
          }}
          className='bg-red-500 text-white rounded-lg hover:bg-red-300 p-3'
        >
          Log Out
        </button>
      </div>

      <h1 className='text-5xl p-10 text-yellow-100 text-center'>Pantry Pilot</h1>

      <div className='flex justify-between w-full max-w-5xl'>
        <button
          onClick={generateRecipe}
          className='text-white bg-blue-500 hover:bg-blue-300 p-3 mb-4 text-xl'
        >
          Generate Recipe
        </button>
      </div>

      {recipe && (
        <div className='bg-white p-4 mb-4 rounded-lg w-full max-w-5xl'>
          <h2 className='text-xl font-bold mb-2'>Generated Recipe</h2>
          <p>{recipe}</p>
        </div>
      )}

      <div className='bg-blue-100 p-9 rounded-lg w-full max-w-5xl'>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-full p-3 mb-4 bg-yellow-100 border border-blue-900 rounded text-blue-900 font-bold'
          type='text'
          placeholder='Search for an item'
        />
        <form className='grid grid-cols-6 items-center text-blue-900 font-bold'>
          <input
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className='col-span-3 p-3 border'
            type='text'
            placeholder='Enter Item'
          />
          <input
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            className='col-span-2 p-3 border mx-3'
            type='number'
            placeholder='Enter quantity'
          />
          <button
            onClick={addItem}
            className='text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl'
            type='submit'
          >
            +
          </button>
        </form>
        <ul>
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className='my-4 w-full flex justify-between bg-slate-950 items-center'
            >
              <div className='p-4 w-full flex justify-between items-center'>
                <span className='capitalize'>{item.name}</span>
                <span>{item.quantity}</span>
                {item.image && (
                  <img src={item.image} alt={item.name} className='ml-4 w-5 h-5' />
                )}
              </div>
              <div className='flex items-center'>
                <input
                  type='file'
                  onChange={(e) => handleImageUpload(item.id, e)}
                  className='hidden'
                  id={`upload-${item.id}`}
                />
                <label htmlFor={`upload-${item.id}`} className='cursor-pointer'>
                  <div className='bg-slate-900 hover:bg-slate-800 w-20 h-8 flex items-center justify-center rounded'>
                    <span className='text-white text-xs'>Upload Image</span>
                  </div>
                </label>
                <button
                  onClick={() => deleteItem(item.id)}
                  className='ml-4 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16'
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        {items.length > 0 && (
          <div className='flex justify-between p-3'>
            <span>Total Quantity</span>
            <span>{total}</span>
          </div>
        )}
      </div>
    </main>
  )
}
