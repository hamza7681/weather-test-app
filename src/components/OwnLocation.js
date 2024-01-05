'use client'

import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { debounce } from 'lodash'

const OwnLocation = () => {
  const [searchCity, setSearchCity] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const [weather, setWeather] = useState(null)
  const [cityData, setCityData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [city, setCity] = useState(null)
  const [geometry, setGeometry] = useState({ lat: null, lng: null })
  const [showDrop, setShowDrop] = useState(false)
  const [refetch, setRefetch] = useState(false)

  const handleChange = (e) => {
    setShowDrop(true)
    let query = e.target.value
    setSearchCity(query)
    handleDebounceApiCall(query)
  }

  const handleDebounceApiCall = debounce(async (value) => {
    try {
      const res = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          value
        )}&key=84d4dbc9cd874ed9b10123e888341479`
      )
      if (res.status === 200 && res.data.results.length > 0) {
        setCity(res.data.results[0])
      }
    } catch (error) {
      console.log(error)
    }
  }, 500)

  useEffect(() => {
    setLoading(true)
    setRefetch(false)
    setSearchCity('')
    navigator.geolocation.getCurrentPosition(async (position) => {
      let lat = position.coords.latitude
      let long = position.coords.longitude
      try {
        const result = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=91547d7948bb9c2e48bd0f66d9e08fbb`
        )
        if (result) {
          const res = await axios.get(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`
          )
          console.log(result)
          setWeather(result.data)
          if (res.data) {
            setCityData(res.data)
            let newCity = res.data
            let city = `${newCity?.locality}, ${newCity?.city}, ${newCity?.principalSubdivision}, ${newCity?.countryName}`
            setSelectedCity(city)
            setLoading(false)
          }
        }
      } catch (error) {
        console.log(error)
      }
    })
  }, [refetch])

  const FindCityWeather = async () => {
    setLoading(true)
    try {
      const result = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${geometry.lat}&lon=${geometry.lng}&appid=91547d7948bb9c2e48bd0f66d9e08fbb`
      )
      if (result) {
        setSelectedCity(city.formatted)
        console.log(result)
        setWeather(result.data)
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const SetImages = ({ weatherType }) => {
    if (weatherType === 'mist' || weatherType === 'haze') {
      return <Image src='/images/fog.png' alt='weather_status' height={120} width={120} />
    } else if (weatherType === 'clear sky') {
      return <Image src='/images/sun.png' alt='weather_status' height={120} width={120} />
    } else if (weatherType === 'snow') {
      return <Image src='/images/snowflake.png' alt='weather_status' height={120} width={120} />
    } else if (weatherType === 'rain' || weatherType === 'thunderstorm' || weatherType === 'shower rain') {
      return <Image src='/images/raining.png' alt='weather_status' height={120} width={120} />
    } else if (
      weatherType === 'few clouds' ||
      weatherType === 'scattered clouds' ||
      weatherType === 'broken clouds' ||
      weatherType === 'overcast clouds'
    ) {
      return <Image src='/images/cloud.png' alt='weather_status' height={120} width={120} />
    }
  }

  return (
    <div className='w-full flex flex-col gap-5 p-5' onClick={() => setShowDrop(false)}>
      <div className='w-full flex gap-2 justify-start items-center'>
        <div className='w-1/12 bg-[#e9e8e8] px-2 py-3 rounded-[4px] text-center'>
          <label className='text-sm' htmlFor='city'>
            Search City
          </label>
        </div>
        <div className='w-8/12 relative'>
          <input
            id='city'
            placeholder='search by city'
            value={searchCity}
            onChange={handleChange}
            className='border-[1px] border-gray-200 px-2 py-3 rounded-[4px] w-full focus:outline-none'
          />

          {showDrop && (
            <div className='absolute top-[52px] w-full border-[1px] border-gray-200 rounded-[5px] shadow-md z-[99] h-[200px] bg-white'>
              {city ? (
                <p
                  className='text-sm text-teal-500 p-4 hover:bg-gray-100 cursor-pointer'
                  onClick={() => {
                    setSearchCity(city.formatted)
                    setGeometry(city.geometry)
                    setShowDrop(false)
                  }}>
                  {city.formatted}
                </p>
              ) : (
                <p className='text-sm text-red-500 p-4 hover:bg-gray-100'>Not Found!</p>
              )}
            </div>
          )}
        </div>
        <div className='w-1/12'>
          <button className='bg-teal-500 w-full px-2 py-3 rounded-[4px] text-white' onClick={FindCityWeather}>
            Find
          </button>
        </div>
        <div className='w-1/12'>
          <button className='bg-blue-500 w-full px-2 py-3 rounded-[4px] text-white' onClick={() => setRefetch(true)}>
            Current Location
          </button>
        </div>
      </div>
      {loading ? (
        <p>loading...</p>
      ) : (
        <div className='flex flex-col gap-2'>
          <div>
            <p>Current Location and Weather</p>
            <p>
              City: <span className='font-bold text-teal-500'>{selectedCity}</span>
            </p>
          </div>
          <div className='w-full flex justify-center items-center'>
            <div className='w-[300px] flex flex-col border-[1px] border-gray-200 shadow-md rounded-[5px] p-5'>
              <div className='flex justify-center items-center'>
                <SetImages weatherType={weather?.weather[0].description} />
              </div>
              <p className='flex items-center justify-center pt-5 font-bold text-[38px]'>
                {Math.floor(weather?.main.temp - 273.16)} <sup className='text-sm relative -top-[10px]'>o</sup>C
              </p>
              <div className='flex justify-start items-center gap-3 py-3'>
                <Image src='/images/pressure-gauge.png' alt='weather_status' height={30} width={30} />
                <p>Pressure {weather?.main.pressure} mm/Hg</p>
              </div>
              <div className='flex justify-start items-center gap-3 py-3'>
                <Image src='/images/eye.png' alt='weather_status' height={30} width={30} />
                <p>Visibility {(weather?.visibility / 1000).toFixed(1)} Km</p>
              </div>
              <div className='flex justify-start items-center gap-3 py-3'>
                <Image src='/images/humidity.png' alt='weather_status' height={30} width={30} />
                <p>Humidity {weather?.main.humidity} %</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnLocation
