const fs = require('fs')
const queryString = require('query-string')
const _uniq = require('lodash/uniq')
const shell = require('shelljs')

const FILE_PATH_BOOKMARKS = '/Users/theo/Library/Application Support/Google/Chrome/Default/Bookmarks'
const FILE_PATH_ERROR_LOG = 'error-log.json'
const FILE_PATH_SONGS = 'songs'

const bookmarksFile = JSON.parse(fs.readFileSync(FILE_PATH_BOOKMARKS))
const songsArray = bookmarksFile.roots.bookmark_bar.children[4].children

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

shell.exec(`brew upgrade youtube-dl`)

for (let { id, name } of songs) {
  const errorLog = JSON.parse(fs.readFileSync(FILE_PATH_ERROR_LOG))
  const currentFileNames = fs.readdirSync(FILE_PATH_SONGS)

  const fileExists = currentFileNames.some(file => file.includes(id))
  const fileHasError = errorLog[id] != null

  if (fileExists || fileHasError) {
    console.log(`Skipping ${name}`)
  } else {
    const result = shell.exec(getCommand(id))
    if (result.code !== 0) {
      errorLog[id] = { error: result.stderr || 'N/A', name }
    } else {
      console.log(`${name} downloaded!`)
    }
  }

  fs.writeFileSync(FILE_PATH_ERROR_LOG, JSON.stringify(errorLog, null, 2))
}

console.log('✅ Done!')
