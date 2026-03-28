import { useEffect } from "react"
import { useParams } from "react-router-dom"
import useRecapStore from "../stores/recapStore"

export default function useRecap() {
  const { year } = useParams()
  const { recapData, slideConfig, themePack, loading, error, fetchRecap } = useRecapStore()

  useEffect(() => {
    if (year) {
      fetchRecap(parseInt(year, 10))
    }
  }, [year, fetchRecap])

  return { recapData, slideConfig, themePack, loading, error, year: parseInt(year, 10) }
}
