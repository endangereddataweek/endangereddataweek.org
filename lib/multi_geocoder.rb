# frozen_string_literal: true

require 'active_support/configurable'
require 'dotenv'
require 'geocoder'

Dotenv.load

##
# Attempt to use multiple geocoders should an issue arise with one of them
#
# Adapated from https://gist.github.com/phallstrom/85670d895b3629e481a7
#
class MultiGeocoder
  include ActiveSupport::Configurable

  config.lookups = [
    { lookup:
        :google, api_key: ENV.fetch('MAP_KEY_GOOGLE', ''), use_https: true
    },
    { lookup: :bing, api_key: ENV.fetch('MAP_KEY_BING', '') },
    { lookup: :geocoder_ca, api_key: ENV.fetch('MAP_KEY_GEOCODER_CA', '') },
    { lookup: :yandex, api_key: ENV.fetch('MAP_KEY_YANDEX', '') }
  ]

  @@errors

  config.lookup_idx = 0

  class << self
    ##
    # Retrieve coordinates
    #  :args: name
    #
    def coordinates(address)

      Geocoder.configure(always_raise: :all)

      begin
        Geocoder.configure(config.lookups[config.lookup_idx])
        puts "Querying '#{address}' with #{Geocoder.config.lookup} using api key "\
        "'#{Geocoder.config.api_key}'".yellow
        result = Geocoder.search(address)
      rescue Geocoder::Error => e
        config.lookup_idx += 1
        if config.lookup_idx >= config.lookups.size
          raise e
        else
          retry
        end
      end

      result
    end

    ##
    # Geocode an instance
    #  :args: instance
    #
    def geocode!(instance)
      result = coordinates(instance).first
      if result
        {
          lat: result.latitude,
          lon: result.longitude,
          region: result.state_code,
          locality: result.city,
          postalcode: result.postal_code,
          address: result.address
        }
      else
        {}
      end
    end
  end
end
