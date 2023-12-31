import { useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import Button from '../base/Button'
import Segment from './components/Segment'
import SearchAndView from './components/SearchAndView'
import { useStepContext } from '@renderer/contexts/stepContext'
import { IoIosArrowBack } from 'react-icons/io'
import TextView from './components/TextView'

/**
 * Look for different folders structure as component grows
 * Consider using context to move segments state logic from video-player component.
 */

const VideoPlayer = ({ path, segments }): JSX.Element => {
  const ref = useRef(null)
  const { setStep } = useStepContext()
  const [stateSegments, setStateSegments] = useState<Record<any, any>[]>(segments)
  const [term, setTerm] = useState<string>('')
  const [view, setView] = useState<string>('list')

  const handleViewChange = (view: string): void => setView(view)

  const handleSegmentClick = (start: number): void => {
    if (ref.current) {
      ;(ref.current as ReactPlayer).seekTo(start, 'seconds')
    }
  }

  const onAddSegment = (segment: Record<string, number | string>): void => {
    setStateSegments((prev) =>
      prev.map(({ id, ...rest }) =>
        id === segment.id ? { ...segment, checked: true } : { id, ...rest }
      )
    )
  }

  const onRemoveSegment = (segment: Record<string, number | string>): void => {
    setStateSegments((prev) =>
      prev.map(({ id, ...rest }) =>
        id === segment.id ? { ...segment, checked: false } : { id, ...rest }
      )
    )
  }

  const handleSearchChange = (term: string): void => {
    if (!term) {
      setStateSegments(segments)
    }
    setTerm(term)
    const filteredSegments = segments.filter(({ text }) =>
      text.toLowerCase().includes(term.toLowerCase())
    )
    setStateSegments(filteredSegments)
  }

  // Consider creating lazy UseIpc hook.
  const generateVideo = async (): Promise<void> => {
    // @ts-ignore - window is undefined
    await window.api.generateVideo(path, selectedSegments)
  }

  return (
    <div className="flex-col w-[720px]">
      <ReactPlayer
        height="100%"
        width="100%"
        ref={ref}
        url={`file-protocol://${path}`}
        controls
        style={{
          borderRadius: '20px',
          overflow: 'hidden'
        }}
        autoPlay
      />

      <SearchAndView onSearchChange={handleSearchChange} onViewChange={handleViewChange} />
      {/*Move this view to separate component keep it here for now to avoid props drilling.*/}
      {view === 'list' ? (
        <>
          <div className="h-fit max-h-[620px] overflow-y-scroll">
            {stateSegments.map(({ id, text, start, end, checked }) => {
              return (
                <Segment
                  key={id}
                  id={id}
                  text={text}
                  start={start}
                  end={end}
                  checked={checked}
                  onSegmentClick={handleSegmentClick}
                  onAddSegment={onAddSegment}
                  onRemoveSegment={onRemoveSegment}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-2 md:mt-4 mb-4 md:mr-2 lg:mr-2">
            <Button onClick={(): void => setStep(0)} icon={<IoIosArrowBack />} />
            <Button onClick={generateVideo} label="Export" />
          </div>
        </>
      ) : (
        <TextView generateVideo={generateVideo} segments={segments} searchTerm={term} />
      )}
    </div>
  )
}

export default VideoPlayer
