import {
  Box,
  Flex,
  IconButton,
  Input,
  Select,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { Atm, listAtm } from './services/listAtm'
import { Marker } from './Marker'
import { Bank, listBank } from './services/listBank'
import { District, listDistrict } from './services/listDistrict'
import { EditIcon } from '@chakra-ui/icons'
import { AdminDrawer } from './AdminDrawer'
const center = { lat: 22.3316025, lng: 114.12776 }
const zoom = 12
export const App = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map>()
  const [banks, setBanks] = useState<Bank[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [atms, setAtms] = useState<Atm[]>([])

  const [district, setDistrict] = useState<string>()
  const [address, setAddress] = useState<string>()
  const [bankName, setBankName] = useState<string>()
  const [language, setLanguage] = useState<string>('en')

  useEffect(() => {
    const fn = async () => {
      const [{ banks }, { districts }] = await Promise.all([
        listBank({ language }),
        listDistrict({ language }),
      ])

      setBanks(banks)
      setDistricts(districts)
    }
    void fn()
  }, [language])

  useEffect(() => {
    const fn = async () => {
      const { latest_record } = await listAtm({
        district,
        address,
        bankName,
        language,
      })
      setAtms(latest_record)
    }
    void fn()
  }, [district, address, bankName, language])

  useEffect(() => {
    if (ref.current && !map) {
      setMap(
        new window.google.maps.Map(ref.current, {
          center,
          zoom,
          clickableIcons: false,
          disableDefaultUI: true,
        })
      )
    }
  }, [ref, map])

  return (
    <Box>
      <Flex
        position="fixed"
        w="50"
        top="4"
        left="4"
        gap="2"
        zIndex="1"
        px="2"
        bg="white"
        borderWidth="2px"
        borderRadius="md"
      >
        <Select
          size="sm"
          placeholder="District"
          variant="flushed"
          border="0"
          value={district}
          onChange={e => {
            setDistrict(e.target.value)
          }}
        >
          {districts.map(district => (
            <option value={district} key={district}>
              {district}
            </option>
          ))}
        </Select>
        <Select
          size="sm"
          placeholder="Bank"
          variant="flushed"
          border="0"
          value={bankName}
          onChange={e => {
            setBankName(e.target.value)
          }}
        >
          {banks.map(bank => (
            <option value={bank} key={bank}>
              {bank}
            </option>
          ))}
        </Select>
        <Input
          size="sm"
          placeholder="Address"
          variant="flushed"
          border="0"
          value={address}
          onChange={e => {
            setAddress(e.target.value)
          }}
        />
      </Flex>
      <Flex position="fixed" top="4" right="4" zIndex="1" gap="2">
        <Box bg="white" borderWidth="2px" borderRadius="md" w="20" px="2">
          <Select
            size="sm"
            placeholder="Language"
            variant="flushed"
            border="0"
            value={language}
            onChange={e => {
              if (e.target.value) setLanguage(e.target.value)
            }}
          >
            <option value="en">En</option>
            <option value="sc">Sc</option>
            <option value="tc">Tc</option>
          </Select>
        </Box>
        <IconButton
          aria-label="Admin"
          icon={<EditIcon />}
          variant="outline"
          borderWidth="2px"
          bg="white"
          onClick={onOpen}
        />
      </Flex>
      <AdminDrawer
        onClose={onClose}
        isOpen={isOpen}
        language={language}
        banks={banks}
        districts={districts}
      />
      <Box h="100vh" w="100vw" ref={ref} id="map">
        {atms.map(atm => {
          const { item_id, latitude, longitude } = atm
          return (
            <Marker
              key={item_id}
              position={{
                lat: Number(latitude),
                lng: Number(longitude),
              }}
              map={map}
              atm={atm}
            />
          )
        })}
      </Box>
    </Box>
  )
}
