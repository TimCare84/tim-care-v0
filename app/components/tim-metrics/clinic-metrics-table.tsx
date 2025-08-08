"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { timMetricsAPI, ClinicMetrics, DateFilters } from "./api-client"

interface ClinicMetricsTableProps {
  dateRange?: DateFilters
}

export function ClinicMetricsTable({ dateRange }: ClinicMetricsTableProps) {
  const [data, setData] = useState<ClinicMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await timMetricsAPI.getClinicMetrics(dateRange)
        setData(result)
      } catch (err) {
        console.error('Error fetching clinic metrics:', err)
        setError('Error al cargar las métricas por clínica')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Clínica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Clínica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            {error || 'No hay datos disponibles'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Rendimiento por Clínica
          <Badge variant="secondary">{data.total_clinics} clínicas</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clínica</TableHead>
                <TableHead className="text-center">Interacciones</TableHead>
                <TableHead className="text-center">Conversaciones</TableHead>
                <TableHead className="text-center">Tiempo Respuesta</TableHead>
                <TableHead className="text-center">Ejecuciones</TableHead>
                <TableHead className="text-center">Tiempo Ahorrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.clinics_metrics.map((clinic) => (
                <TableRow key={clinic.clinic_id}>
                  <TableCell className="font-medium">{clinic.clinic_name}</TableCell>
                  
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-semibold text-blue-600">
                          {clinic.automated_interactions.value.toLocaleString()}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{clinic.automated_interactions.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-semibold text-green-600">
                          {clinic.conversations.value.toLocaleString()}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{clinic.conversations.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-semibold text-orange-600">
                          {typeof clinic.avg_response_time.value === 'number' 
                            ? `${clinic.avg_response_time.value.toFixed(2)}s`
                            : `${clinic.avg_response_time.value}s`}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{clinic.avg_response_time.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-semibold text-purple-600">
                          {clinic.executions.value.toLocaleString()}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{clinic.executions.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <div className="font-semibold text-indigo-600">
                            {typeof clinic.time_saved_hours.value === 'number' 
                              ? `${clinic.time_saved_hours.value.toFixed(1)}h`
                              : `${clinic.time_saved_hours.value}h`}
                          </div>
                          <div className="text-xs text-gray-500">
                            ({clinic.time_saved_minutes.value} min)
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{clinic.time_saved_hours.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Totales */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">Totales Generales</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {data.totals.total_automated_interactions.toLocaleString()}
              </div>
              <div className="text-gray-600">Interacciones</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {data.totals.total_conversations.toLocaleString()}
              </div>
              <div className="text-gray-600">Conversaciones</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {data.totals.avg_response_time_overall}s
              </div>
              <div className="text-gray-600">Tiempo Promedio</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {data.totals.total_executions.toLocaleString()}
              </div>
              <div className="text-gray-600">Ejecuciones</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">
                {data.totals.total_time_saved_hours}h
              </div>
              <div className="text-gray-600">Tiempo Total Ahorrado</div>
              <div className="text-xs text-gray-500">
                ({data.totals.total_time_saved_minutes} min)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}