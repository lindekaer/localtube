const fs = require('fs')
const queryString = require('query-string')
const _uniq = require('lodash/uniq')
const shell = require('shelljs')

const FILE_PATH_BOOKMARKS = '/Users/theo/Library/Application Support/Google/Chrome/Profile 1/Bookmarks'
const FILE_PATH_PROCESS_LOG = 'process.json'

const currentFileNames = fs.readdirSync('songs')
const processLog = JSON.parse(fs.readFileSync(FILE_PATH_PROCESS_LOG))
const booksmarksFile = JSON.parse(fs.readFileSync(FILE_PATH_BOOKMARKS))

const songsArray = booksmarksFile.roots.bookmark_bar.children[3].children
const songs = _uniq(
  songsArray
    .filter(song => song.url != null)
    .map(song => ({
      id: queryString.parse(song.url.split('?')[1]).v,
      name: song.name.split(' - YouTube')[0]
    }))
)

const getCommand = id =>
  `cd songs && youtube-dl --extract-audio --audio-format mp3 'https://www.youtube.com/watch?v=${id}'`

for (let { id, name } of songs) {
  const fileExists = currentFileNames.some(file => file.includes(id))

  if (fileExists) {
    console.log(`Skipping ${name} - already exists`)
  } else {
    console.log(name + '-' + id)
    const code = shell.exec(getCommand(id)).code
    processLog[id] = code == 0 ? 'downloaded' : 'error'
    currentFileNames.push(`${name}-${id}.mp3`)
  }
}

fs.writeFileSync('process.json', JSON.stringify(processLog, null, 2))

console.log('✅ Done!')
